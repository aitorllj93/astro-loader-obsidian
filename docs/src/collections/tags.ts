import { defineCollection } from 'astro:content';

import { ObsidianMdLoader } from "astro-loader-obsidian";
import { TAGS_COLLECTION_NAME, DEFAULT_VAULT_DIR } from 'astro-spaceship/constants';
import { TagSchema } from 'astro-spaceship/schemas';

import { ENV } from 'varlock/env';


export default {
	[TAGS_COLLECTION_NAME]: defineCollection({
		loader: ObsidianMdLoader({
			base: `${ENV.OBSIDIAN_VAULT_DIR ?? DEFAULT_VAULT_DIR}/About/Tags`,
			url: '',
			tagsUrl: 'about/tags',
			pattern: '**/*.md',
		}),
		schema:  () => TagSchema,
	})
};
