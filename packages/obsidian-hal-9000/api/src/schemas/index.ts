import { DocumentSchema } from "astro-spaceship/schemas";
import { z } from "zod";

export { DocumentSchema }

export const DocumentInputSchema = DocumentSchema.omit({
	title: true,
	slug: true,
	permalink: true, 
	created: true, 
	updated: true,
	images: true,
	links: true,
	zettelkasten: true,
}).extend({
	cssClass: z.union([z.string().array(), z.string()]).optional(),
	cssclasses: z.union([z.string().array(), z.string()]).optional(),
	cover: z.string().optional(),
	image: z.string().optional(),
	aliases: z.string().array().optional(),
	tags: z.string().array().optional(),
	publish: z.union([
		z.literal('true'), z.literal('false'),
	]).optional(),
})

const PlaceProps = z.object({
	'@type': z.literal('Place'),
	additionalType: z.string().optional(),
	address: z.string().optional(),
	identifier: z.string().optional(),
	url: z.string().url().optional(),
})

export const PlaceSchema = DocumentSchema.merge(PlaceProps)

export const PlaceInputSchema = DocumentInputSchema.merge(PlaceProps)
