import { defineCollection } from 'astro:content';
import { glob } from "astro/loaders";

import { AUTHORS_COLLECTION_NAME } from 'astro-spaceship/constants';
import { AuthorSchema } from 'astro-spaceship/schemas';


export default {
	[AUTHORS_COLLECTION_NAME]: defineCollection({
		loader: glob({ pattern: "**/*.yml", base: "./src/content/authors" }),
		schema:  ({ image }) => AuthorSchema.extend({
			avatar: image().optional(),
		})
	}),
};
