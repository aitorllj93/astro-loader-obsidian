import { z } from "astro:content";

const arrayExclude = <S extends z.ZodTypeAny>(s: S) => {
  return z.preprocess((as) => {
    const result: S[] = [];
    if (!Array.isArray(as)) {
      return result;
    }
    for (const a of as) {
      const parsed = s.safeParse(a);
      if (parsed.success) {
        result.push(parsed.data);
      }
    }
    return result;
  }, z.array(s));
};

const commaSeparatedStringArray = z.union([
  z.coerce.string()
    .transform((value) => value.split(','))
    .pipe(arrayExclude(z.string())),
  arrayExclude(z.string()),
]);

export const ObsidianWikiLinkSchema = z.object({
  caption: z.string().nullish(),
  className: z.string().nullish(),
  href: z.string().nullable(),
  id: z.string().optional(),
  isEmbedded: z.boolean(),
  title: z.string(),
  type: z.enum(['image', 'audio', 'video', 'file', 'document', 'tag']),
  source: z.string().optional(),
});

export const ObsidianCoreSchema = z.object({
  tags: arrayExclude(z.string()).nullish(),
  aliases: commaSeparatedStringArray.nullish(),
  cssclasses: commaSeparatedStringArray.nullish(),
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

export const ExtensionsSchema = z.object({
  order: z.number().optional(),
})

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
  .merge(ExtensionsSchema)
  .merge(ZettelkastenSchema);

export const ObsidianDocumentI18nSchema =
  ObsidianDocumentSchema.merge(I18nSchema);

export type ObsidianDocument = z.infer<typeof ObsidianDocumentSchema>;
export type ObsidianLink = z.infer<typeof ObsidianWikiLinkSchema>;
export type Zettelkasten = z.infer<typeof ZettelkastenSchema>;
export type Author = z.infer<typeof AuthorSchema>;
