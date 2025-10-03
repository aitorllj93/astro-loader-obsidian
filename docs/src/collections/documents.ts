import { defineCollection } from 'astro:content';
import { z } from 'zod';

import { ObsidianMdLoader, ObsidianWikiLinkSchema } from "astro-loader-obsidian";

import { DOCUMENTS_COLLECTION_NAME, DEFAULT_VAULT_DIR } from 'astro-spaceship/constants';
import { DocumentSchema } from 'astro-spaceship/schemas';
import config from 'astro-spaceship/config';

import { ENV } from 'varlock/env';

export default {
  [DOCUMENTS_COLLECTION_NAME]: defineCollection({
    loader: ObsidianMdLoader({
      author: config.author,
      base: ENV.OBSIDIAN_VAULT_DIR ?? DEFAULT_VAULT_DIR,
      url: '',
      tagsUrl: 'about/tags',
      wikilinkFields: ['relateds']
    }),
    schema: ({ image }) => DocumentSchema.extend({
      images: ObsidianWikiLinkSchema.extend({
        href: image().optional(),
      }).array().optional(),
      cover: z.union([z.string(), z.object({
        src: z.string(),
        width: z.number(),
        height: z.number(),
        format: z.string(),
      })]).optional(),
      image: image().optional(),
    }),
  })
}