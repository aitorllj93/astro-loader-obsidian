import { z } from "astro:content";

export const ObsidianWikiLinkSchema = z.object({
  title: z.string(),
  href: z.string().nullable(),
  id: z.string().optional(),
  source: z.string().optional(),
});

export const ObsidianCoreSchema = z.object({
  tags: z.array(z.string()).optional(),
  aliases: z.array(z.string()).optional(),
  cssclasses: z.array(z.string()).optional(),
  links: ObsidianWikiLinkSchema.array().optional(),
  images: z
    .array(
      z.object({
        title: z.string(),
        href: z.string(),
      })
    )
    .optional(),
});

export const ObsidianPublishSchema = z.object({
  publish: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
    }
    return val;
  }, z.boolean().optional()),
  permalink: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  cover: z.string().optional(),
});

export const AstroSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const PublishSchema = z.object({
  author: z.string().optional(),
  created: z.date(),
  updated: z.date(),
});

export const I18nSchema = z.object({
  language: z.string(),
});

export const AuthorSchema = z.object({
  name: z.string(),
  portfolio: z.string().url(),
  avatar: z.string().url(),
});

export const ZettelkastenDateIdMetaSchema = z.object({
  date: z.date().optional(),
})
export const ZettelkastenLuhmannIdMetaSchema = z.object({
  breadcrumbs: z.object({
    id: z.string(),
    path: z.string(),
  }).array().optional(),
});

export const ZettelkastenIdMetaSchema = z.union([
  ZettelkastenDateIdMetaSchema, ZettelkastenLuhmannIdMetaSchema,
]);

export const ZettelkastenSchema = z.object({
  zettelkasten: z.object({
    id: z.string(),
    meta: ZettelkastenIdMetaSchema.nullable(),
  }).optional(),
})

export const ObsidianDocumentSchema = ObsidianCoreSchema.merge(
  ObsidianPublishSchema
)
  .merge(PublishSchema)
  .merge(AstroSchema)
  .merge(ZettelkastenSchema);

export const ObsidianDocumentI18nSchema =
  ObsidianDocumentSchema.merge(I18nSchema);

export type ObsidianDocument = z.infer<typeof ObsidianDocumentSchema>;
export type ObsidianLink = z.infer<typeof ObsidianWikiLinkSchema>;
export type Zettelkasten = z.infer<typeof ZettelkastenSchema>;
export type Author = z.infer<typeof AuthorSchema>;
