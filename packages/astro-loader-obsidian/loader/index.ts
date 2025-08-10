import fastGlob from "fast-glob";
import { green } from "kleur/colors";
import micromatch from "micromatch";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import pLimit from "p-limit";

import type { DataStore, LoaderContext } from "astro/loaders";

import type { ObsidianContext, ObsidianMdLoaderOptions, StoreDocument } from "../types";

import { generateId, toRelativePath } from "../astro";

import { isConfigFile, getEntryInfo } from "../obsidian";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_ASSET_EXTENSIONS,
} from "../obsidian/constants";
import type { ContentEntryType } from "astro";
import type { ObsidianDocument } from "../schemas";
import { renderObsidian } from "../obsidian/render";
import { exposeObsidianAsset, getAssetsPublicUrl } from "../obsidian/assets";

export type { ObsidianMdLoaderOptions };

const MAX_WAIT_RETRIES = 4;

type ExtendedLoaderContext = LoaderContext & {
  entryTypes: Map<string, ContentEntryType>;
};

const waitForDependencies = (store: DataStore, ids: string[], retries = 0) => new Promise<StoreDocument<ObsidianDocument>[]>((resolve, reject) => {
  const dependencies = ids.map(id => store.get(id));

  const hasMissingDependencies = dependencies.some(d => d === undefined);

  if (!hasMissingDependencies) {
    resolve(dependencies as StoreDocument<ObsidianDocument>[]);
    return;
  }

  if (retries === MAX_WAIT_RETRIES) {
    reject(new Error(`Embed documents ${ids.join(', ')} are unavailable`));
    return;
  }

  setTimeout(() => waitForDependencies(store, ids, retries + 1).then(resolve).catch(reject), 1000);
})

export const ObsidianMdLoaderFn =
  (opts: ObsidianMdLoaderOptions) =>
    async ({
      collection,
      config,
      entryTypes,
      generateDigest,
      logger,
      parseData,
      store,
      watcher,
    }: ExtendedLoaderContext): Promise<void> => {
      // Configure the loader
      const fileToIdMap = new Map<string, string>();
      const pattern =
        opts.pattern ?? `**/*.${ALLOWED_DOCUMENT_EXTENSIONS[0].replace(".", "")}`;
      const assetsPattern =
        opts.assetsPattern ??
        `**/*.{${ALLOWED_ASSET_EXTENSIONS.map((ext) => ext.replace(".", "")).join(
          ","
        )}}`;
      const baseUrl = opts.url ?? collection;
      const baseDir = opts.base ? new URL(opts.base, config.root) : config.root;
      if (!baseDir.pathname.endsWith("/")) {
        baseDir.pathname = `${baseDir.pathname}/`;
      }
      const dirPath = fileURLToPath(baseDir);

      const render = await entryTypes
        .get(ALLOWED_DOCUMENT_EXTENSIONS[0])
        ?.getRenderFunction?.(config);

      const untouchedEntries = new Set(store.keys());

      const getAssets = () =>
        fastGlob(assetsPattern, {
          cwd: dirPath,
        });
      const getFiles = () =>
        fastGlob(pattern, {
          cwd: dirPath,
        }).then((files) =>
          files.filter((f) => !isConfigFile(f, baseDir.toString()))
        );

      const getContext = (entry: string, files: string[], assets: string[]): ObsidianContext => ({
        assets,
        author: opts.author,
        base: opts.base,
        baseUrl: `${config.base}${baseUrl}`,
        publicUrl: getAssetsPublicUrl(baseDir, config.base),
        entry,
        files,
        i18n: opts.i18n,
        defaultLocale: config.i18n?.defaultLocale,
        options: opts,
      })

      async function getData(
        entry: string,
        base: URL,
        files: string[],
        assets: string[]
      ) {
        const fileUrl = new URL(encodeURI(entry), base);
        const filePath = fileURLToPath(fileUrl);
        const relativePath = toRelativePath(fileURLToPath(config.root), filePath);

        const contents = await readFile(fileUrl, "utf-8").catch((err) => {
          logger.error(`Error reading ${entry}: ${err.message}`);
          return;
        });

        const stats = await stat(fileUrl);

        if (!contents && contents !== "") {
          logger.warn(`No contents found for ${entry}`);
          return;
        }

        const { body, data, wikilinks, wikitags, } = await getEntryInfo(
          contents,
          fileUrl,
          entry,
          stats,
          getContext(entry, files, assets),
          logger
        );
        const id = generateId({ entry, base, data });

        if (opts.skipUnpublishedEntries !== false && data.publish?.toString() === 'false') {
          logger.debug(`Entry ${id} has publish: false, skipping...`)
          return;
        }

        untouchedEntries.delete(id);

        const existingEntry = store.get(id);

        const digest = generateDigest(contents);

        if (existingEntry && existingEntry.data.title !== data.title) {
          logger.error(
            `Duplicate id ${id} on entries: [${existingEntry.data.title}, ${data.title}]`
          );
        }

        if (
          existingEntry &&
          existingEntry.digest === digest &&
          existingEntry.filePath
        ) {
          if (existingEntry.deferredRender) {
            store.addModuleImport(existingEntry.filePath);
          }

          return;
        }

        return {
          id,
          entry,
          body,
          filePath,
          relativePath,
          digest,
          data,
          wikilinks,
          wikitags,
        }
      }

      async function renderData(
        entryData: Awaited<ReturnType<typeof getData>>,
      ) {
        if (!entryData) {
          return;
        }

        const { id, entry, body, filePath, digest, data } = entryData;

        let rendered = undefined;

        try {
          rendered = await render?.({
            id,
            data,
            body,
            filePath,
            digest,
          });
        } catch (error) {
          logger.error(`Error rendering ${entry}: ${(error as Error).message}`);
          throw error;
        }

        return {
          entryData,
          rendered,
        };
      }

      const sortFiles = (
        files: Awaited<ReturnType<typeof renderData>>[],
        maxPerFile = 5
      ) => {
        const result: Awaited<ReturnType<typeof renderData>>[] = [];
        const processCounts: Record<string, number> = {};

        while (files.length > 0) {
          const current = files[0];

          if (!current?.entryData.id) {
            files.shift();
            continue;
          }

          processCounts[current.entryData.id] = (processCounts[current.entryData.id] || 0) + 1;
      
          if ((processCounts[current.entryData.id] ?? 0) > maxPerFile) {
            result.push(files.shift());
          }

          const deps = current.entryData.wikilinks.filter(l => 
            l.link.type === 'document' && 
            l.link.isEmbedded && l.link.id
            && files.some(f => f?.entryData.id === l.link.id)
          );

          if (deps.length === 0) {
            result.push(files.shift());
          } else {
            files.push(files.shift());
          }
        }

        return result;
      }

      async function renderObsidianData(
        renderedData: Awaited<ReturnType<typeof renderData>>,
      ) {
        if (!renderedData || !renderedData.entryData || !renderedData.rendered) {
          return;
        }
        const { rendered, entryData } = renderedData;

        const obsidian = await renderObsidian(rendered as StoreDocument['rendered'], entryData.wikilinks, entryData.wikitags, store, logger);
    
        const links = (entryData.data.links ?? [])?.concat(obsidian.links);

        entryData.data.links = links.filter(
          (l, i) => links?.findIndex((dl) => dl.href === l.href) === i
        );
        rendered.html = obsidian.content;

        // TODO: Enable later
        // data.images = parsedBody.images as { title: string; href: string }[];

        return {
          entryData,
          rendered,
        }
      }

      async function persistData(
        
        obsidian: Awaited<ReturnType<typeof renderObsidianData>>,
      ) {
        if (!obsidian) {
          return;
        }

        const { entryData, rendered } = obsidian;
        const { body, filePath, id, data, relativePath, digest } = entryData;

        const parsedData = await parseData({
          id,
          data,
          filePath,
        });

        if (rendered) {
          store.set({
            id,
            data: parsedData,
            body,
            filePath: relativePath,
            digest,
            rendered,
            assetImports: rendered.metadata?.imagePaths ?? [],
          });
        } else {
          store.set({
            id,
            data: parsedData,
            body,
            filePath: relativePath,
            digest,
          });
        }

        fileToIdMap.set(filePath, id);
      }

      // async function syncData(
      //   entry: string,
      //   base: URL,
      //   files: string[],
      //   assets: string[]
      // ) {
      //   const entryData = await limit(() => getData(entry, base, files, assets));
      //   const rendered = await limit(() => renderData(entryData));
      //   const obsidian = await limit(() => renderObsidianData(rendered));

      //   await limit(() => persistData(obsidian));
      // }

      // Load data and update the store

      const limit = pLimit(10);

      const files = await getFiles();
      const assets = await getAssets();

      await (Promise.all(
        assets.map(a => limit(() => exposeObsidianAsset(a, baseDir, config.publicDir)))
      ));

      // await Promise.all(
      //   files.map((entry) => syncData(entry, baseDir, files, assets))
      // );

      await (
        Promise.all(
          files.map(f => limit(() => getData(f, baseDir, files, assets)))
        ).then(
          entries => Promise.all(
            entries.map(entry => limit(() => renderData(entry)))
          )
        )
        .then(sortFiles)
        .then(
          async (renders) => {
            for (const render of renders) {
              const obsidian = await renderObsidianData(render);
              await persistData(obsidian);
            }
          }
        )
      );

      // Remove entries that were not found this time
      for (const untouchedEntry of untouchedEntries) {
        store.delete(untouchedEntry);
      }

      if (!watcher) {
        return;
      }

      watcher.add(dirPath);
      const matchesGlob = (entry: string) =>
        !entry.startsWith("../") && micromatch.isMatch(entry, pattern);

      async function onChange(changedPath: string) {
        const entry = toRelativePath(dirPath, changedPath);
        if (!matchesGlob(entry)) {
          return;
        }
        const baseUrl = pathToFileURL(dirPath);

        await limit(() => getData(entry, baseUrl as URL, files, assets))
          .then((entryData) => limit(() => renderData(entryData)))
          .then((rendered) => limit(() => renderObsidianData(rendered)))
          .then((obsidian) => limit(() => persistData(obsidian)))

        logger.info(`Reloaded data from ${green(entry)}`);
      }

      async function onDelete(deletedPath: string) {
        const entry = toRelativePath(dirPath, deletedPath);
        if (!matchesGlob(entry)) {
          return;
        }
        const id = fileToIdMap.get(deletedPath);
        if (id) {
          store.delete(id);
          fileToIdMap.delete(deletedPath);
        }
      }

      watcher.on("change", onChange);
      watcher.on("add", onChange);
      watcher.on("unlink", onDelete);
    };
