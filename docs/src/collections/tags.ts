import { defineCollection, z } from 'astro:content';
import { glob } from "astro/loaders";

import { TAGS_COLLECTION_NAME } from 'astro-spaceship/constants';
import { TagSchema } from 'astro-spaceship/schemas';


export default {
	[TAGS_COLLECTION_NAME]: defineCollection({
		loader: glob({ pattern: "**/*.yml", base: "./src/content/tags" }),
		schema:  () => TagSchema,
	})
};
