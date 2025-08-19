import { ObsidianDocumentSchema, ObsidianWikiLinkSchema } from "astro-loader-obsidian";
import { z } from "zod";

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
  location: LocationSchema.optional(),
  additionalType: z.string().optional(),
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

export const ConfigSchema = z.object({
  author: z.string().optional(),
  base: z.string().optional(),
  defaultLocale: z.string().optional().default('en'),
  locales: z.string().array().optional(),
  description: z.string().optional(),
  site: z.string().optional(),
  title: z.string().optional(),
  logo: z.string().optional(),
  features: z.object({
    article: z.object({
      author: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({}),
      publishDate: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({})
    }).optional().default({}),
    rightSidebar: z.object({
      mode: z.union([z.literal('tabset'), z.literal('column')]).default('tabset'),
      map: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({}),
      graph: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({}),
      toc: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({}),
      links: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({}),
      backlinks: z.object({
        enabled: z.boolean().default(true)
      }).optional().default({}),
    }).optional().default({})
  }).optional().default({})
})

/** Custom Types **/

const PlaceProps = z.object({
  '@type': z.literal('Place'),
  additionalType: z.string().optional(),
  address: z.string().optional(),
  identifier: z.string().optional(),
  url: z.string().url().optional(),
})

export const PlaceSchema = DocumentSchema.merge(PlaceProps)