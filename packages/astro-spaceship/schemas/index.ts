import { ObsidianDocumentSchema, ObsidianWikiLinkSchema } from "astro-loader-obsidian";
import { z } from "zod";

import { DEFAULT_ARTICLE_AUTHOR_ENABLED, DEFAULT_ARTICLE_DATE_ENABLED, DEFAULT_LOCALE, DEFAULT_RIGHT_SIDEBAR_BACKLINKS_ENABLED, DEFAULT_RIGHT_SIDEBAR_GRAPH_ENABLED, DEFAULT_RIGHT_SIDEBAR_LINKS_ENABLED, DEFAULT_RIGHT_SIDEBAR_MAP_ENABLED, DEFAULT_RIGHT_SIDEBAR_MODE, DEFAULT_RIGHT_SIDEBAR_TOC_ENABLED, DEFAULT_VAULT_DIR } from "../constants";

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
  defaultLocale: z.string().optional().default(DEFAULT_LOCALE),
  locales: z.string().array().optional(),
  description: z.string().optional(),
  site: z.string().optional(),
  title: z.string().optional(),
  logo: z.string().optional(),
  vaultDir: z.string().optional().default(DEFAULT_VAULT_DIR),
  features: z.object({
    article: z.object({
      author: z.object({
        enabled: z.boolean().default(DEFAULT_ARTICLE_AUTHOR_ENABLED)
      }).optional().default({}),
      publishDate: z.object({
        enabled: z.boolean().default(DEFAULT_ARTICLE_DATE_ENABLED)
      }).optional().default({})
    }).optional().default({}),
    rightSidebar: z.object({
      mode: z.union([z.literal('tabset'), z.literal('column')]).default(DEFAULT_RIGHT_SIDEBAR_MODE),
      map: z.object({
        enabled: z.boolean().default(DEFAULT_RIGHT_SIDEBAR_MAP_ENABLED)
      }).optional().default({}),
      graph: z.object({
        enabled: z.boolean().default(DEFAULT_RIGHT_SIDEBAR_GRAPH_ENABLED)
      }).optional().default({}),
      toc: z.object({
        enabled: z.boolean().default(DEFAULT_RIGHT_SIDEBAR_TOC_ENABLED)
      }).optional().default({}),
      links: z.object({
        enabled: z.boolean().default(DEFAULT_RIGHT_SIDEBAR_LINKS_ENABLED)
      }).optional().default({}),
      backlinks: z.object({
        enabled: z.boolean().default(DEFAULT_RIGHT_SIDEBAR_BACKLINKS_ENABLED)
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