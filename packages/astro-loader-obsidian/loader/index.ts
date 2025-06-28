import fastGlob from "fast-glob";
import { green } from "kleur/colors";
import micromatch from "micromatch";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import pLimit from "p-limit";

import type { LoaderContext } from "astro/loaders";

import type { ObsidianMdLoaderOptions } from "../types";

import { generateId, toRelativePath } from "../astro";

import { isConfigFile, getEntryInfo } from "../obsidian";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
} from "../obsidian/constants";
import type { ContentEntryType } from "astro";

export type { ObsidianMdLoaderOptions };

type ExtendedLoaderContext = LoaderContext & {
  entryTypes: Map<string, ContentEntryType>;
};

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
      `**/*.{${ALLOWED_IMAGE_EXTENSIONS.map((ext) => ext.replace(".", "")).join(
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

    async function syncData(
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

      const { body, data } = await getEntryInfo(
        contents,
        fileUrl,
        entry,
        stats,
        {
          assets,
          author: opts.author,
          base: opts.base,
          baseUrl: `${config.base}${baseUrl}`,
          entry,
          files,
          i18n: opts.i18n,
          defaultLocale: config.i18n?.defaultLocale,
          options: opts,
        },
        logger
      );
      const id = generateId({ entry, base, data });

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

      const parsedData = await parseData({
        id,
        data,
        filePath,
      });

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

    // Load data and update the store

    const limit = pLimit(10);

    const files = await getFiles();
    const assets = await getAssets();

    await Promise.all(
      files.map((entry) =>
        limit(async () => {
          await syncData(entry, baseDir, files, assets);
        })
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
      await syncData(entry, baseUrl as URL, files, assets);
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
