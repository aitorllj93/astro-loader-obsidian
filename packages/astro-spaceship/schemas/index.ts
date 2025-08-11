import { ObsidianDocumentSchema, ObsidianWikiLinkSchema } from "astro-loader-obsidian";
import { z } from "astro/zod";

const AstroImageSchema = z.object({
  src: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.union([z.literal('png'), z.literal('jpeg'), z.literal('tiff'), z.literal('webp'), z.literal('gif'), z.literal('svg'), z.literal('avif'),]),
});

export const LocationSchema = z.string().array().transform((val) => {
  if (!val[0]) {
    return null;
  }

  const [lat, lng] = val[0].split(',').map(v => Number.parseFloat(v.trim()));
  
  return {
    lat,
    lng,
  };

})
.pipe(z.object({
  lat: z.number(),
  lng: z.number(),
}))

export const DocumentSchema = ObsidianDocumentSchema.extend({
  images: ObsidianWikiLinkSchema.extend({
    href: AstroImageSchema.optional(),
  }).array().optional(),
  cover: AstroImageSchema.optional(),
  image: AstroImageSchema.optional(),
  subtitle: z.string().optional(),
  'cover-x': z.number().optional(),
  'cover-y': z.number().optional(),
  location: LocationSchema.nullish(),
});

export const AuthorSchema = z.object({
  avatar: AstroImageSchema.optional(),
  name: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
})

export const TagSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  permalink: z.string().optional(),
})