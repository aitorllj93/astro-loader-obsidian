import fastGlob from "fast-glob";
import { green } from "kleur/colors";
import micromatch from "micromatch";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import pLimit from "p-limit";

import type { Loader, LoaderContext } from "astro/loaders";

import { ObsidianDocumentSchema } from "./schemas";
import type { ObsidianMdLoaderOptions } from "./types";
import {
  generateId,
  getEntryInfo,
  isConfigFile,
  posixRelative,
  type DataEntry,
  type RenderedContent
} from "./utils";
import type { ObsidianContext } from "./utils/obsidian";

const DEFAULT_PATTERN = "**/*.md";
const DEFAULT_ASSETS_PATTERN = "**/*.{svg,png,jpg,jpeg,avif,webp,gif,tiff,ico}";

export type { ObsidianMdLoaderOptions };

// Define any options that the loader needs
export const ObsidianMdLoader: (opts: ObsidianMdLoaderOptions) => Loader = (
  opts
) => {
  // Configure the loader

  const fileToIdMap = new Map<string, string>();
  const pattern = opts.pattern ?? DEFAULT_PATTERN;
  const assetsPattern = opts.assetsPattern ?? DEFAULT_ASSETS_PATTERN;

  // Return a loader object
  return {
    name: "obsidianmd",
    // Called when updating the collection.
    load: async ({
      collection,
      config,
      entryTypes,
      generateDigest,
      logger,
      parseData,
      store,
      watcher,
    }: LoaderContext & { entryTypes: WeakMap<any, any> }): Promise<void> => {
      const untouchedEntries = new Set(store.keys());

      async function syncData(
        entry: string,
        base: URL,
        files: string[],
        assets: string[]
      ) {
        const fileUrl = new URL(encodeURI(entry), base);
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
          } as ObsidianContext,
          logger as unknown as Console
        );
        const id = generateId({ entry, base, data });

        untouchedEntries.delete(id);

        const existingEntry = store.get(id);

        const digest = generateDigest(contents);

        if (existingEntry && existingEntry.data.title !== data.title) {
          logger.error(`Duplicate id ${id} on entries: [${existingEntry.data.title}, ${data.title}]`)
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

        const filePath = fileURLToPath(fileUrl);
        const relativePath = posixRelative(
          fileURLToPath(config.root),
          filePath
        );

        const parsedData = await parseData({
          id,
          data,
          filePath,
        });

        let rendered: RenderedContent | undefined = undefined;

        try {
          const renderFn = await entryTypes.get('.md').getRenderFunction(config);
          rendered = await renderFn?.({
            id,
            data: parsedData,
            body,
            filePath,
            digest,
          });
        } catch (error) {
          logger.error(`Error rendering ${entry}: ${(error as Error).message}`);
          throw error;
        }

        store.set({
          id,
          data: parsedData,
          body,
          filePath: relativePath,
          digest,
          rendered,
          assetImports: [
            ...(rendered?.metadata?.imagePaths ?? []),
            parsedData.cover,
            parsedData.image,
          ].filter(Boolean),
        } as DataEntry);

        fileToIdMap.set(filePath, id);
      }

      // Load data and update the store

      const baseDir = opts.base ? new URL(opts.base, config.root) : config.root;
      const baseUrl = opts.url ?? collection;

      if (!baseDir.pathname.endsWith("/")) {
        baseDir.pathname = `${baseDir.pathname}/`;
      }

      const assets = await fastGlob(assetsPattern, {
        cwd: fileURLToPath(baseDir),
      });
      const files = await fastGlob(pattern, {
        cwd: fileURLToPath(baseDir),
      });
      const limit = pLimit(10);

      await Promise.all(
        files.map((entry) => {
          if (isConfigFile(entry, baseDir.toString())) {
            return;
          }

          return limit(async () => {
            await syncData(entry, baseDir, files, assets);
          });
        })
      );

      // Remove entries that were not found this time
      for (const untouchedEntry of untouchedEntries) {
        store.delete(untouchedEntry)
      }

      if (!watcher) {
        return;
      }

      const matchesGlob = (entry: string) =>
        !entry.startsWith("../") && micromatch.isMatch(entry, pattern);

      const basePath = fileURLToPath(baseDir);

      async function onChange(changedPath: string) {
        const entry = posixRelative(basePath, changedPath);
        if (!matchesGlob(entry)) {
          return;
        }
        const baseUrl = pathToFileURL(basePath);
        await syncData(entry, baseUrl as URL, files, assets);
        logger.info(`Reloaded data from ${green(entry)}`);
      }

      watcher.on("change", onChange);

      watcher.on("add", onChange);

      watcher.on("unlink", async (deletedPath) => {
        const entry = posixRelative(basePath, deletedPath);
        if (!matchesGlob(entry)) {
          return;
        }
        const id = fileToIdMap.get(deletedPath);
        if (id) {
          store.delete(id);
          fileToIdMap.delete(deletedPath);
        }
      });
    },
    // Optionally, define the schema of an entry.
    // It will be overridden by user-defined schema.
    schema: async () => ObsidianDocumentSchema,
  } as unknown as Loader;
};
