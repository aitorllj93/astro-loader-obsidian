import { defineCollection } from "astro:content";

import { ObsidianMdLoader } from "astro-loader-obsidian";
import {
  AUTHORS_COLLECTION_NAME,
  DEFAULT_VAULT_DIR,
} from "astro-spaceship/constants";
import { AuthorSchema } from "astro-spaceship/schemas";

import { ENV } from "varlock/env";

export default {
  [AUTHORS_COLLECTION_NAME]: defineCollection({
    loader: ObsidianMdLoader({
      base: `${ENV.OBSIDIAN_VAULT_DIR ?? DEFAULT_VAULT_DIR}/About/Authors`,
      url: "about/authors",
      pattern: "**/*.md",
    }),
    schema: ({ image }) =>
      AuthorSchema.extend({
        avatar: image().optional(),
      }),
  }),
};
