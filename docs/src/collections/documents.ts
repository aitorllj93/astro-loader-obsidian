import { defineCollection } from 'astro:content';

import { ObsidianMdLoader, ObsidianWikiLinkSchema } from "astro-loader-obsidian";

import { DOCUMENTS_COLLECTION_NAME } from 'astro-spaceship/constants';
import { DocumentSchema } from 'astro-spaceship/schemas';

import config from 'astro-spaceship/config';


export default {
  [DOCUMENTS_COLLECTION_NAME]: defineCollection({
    loader: ObsidianMdLoader({
      author: config.author,
      base: config.vaultDir,
      url: '',
      wikilinkFields: ['relateds']
    }),
    schema: ({ image }) => DocumentSchema.extend({
      images: ObsidianWikiLinkSchema.extend({
        href: image().optional(),
      }).array().optional(),
      cover: image().optional(),
      image: image().optional(),
    }),
  })
}