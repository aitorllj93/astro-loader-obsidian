import type { Loader } from "astro/loaders";

import { ObsidianDocumentSchema } from "./schemas";
import { ObsidianMdLoaderFn } from "./loader";
import type { ObsidianMdLoaderOptions } from "./types";

export type { ObsidianMdLoaderOptions };

// Define any options that the loader needs
export const ObsidianMdLoader: (opts: ObsidianMdLoaderOptions) => Loader = (
  opts
) => {
  // Return a loader object
  return {
    name: "obsidianmd",
    // Called when updating the collection.
    load: ObsidianMdLoaderFn(opts) as Loader['load'],
    // Optionally, define the schema of an entry.
    // It will be overridden by user-defined schema.
    schema: async () => ObsidianDocumentSchema,
  };
};
