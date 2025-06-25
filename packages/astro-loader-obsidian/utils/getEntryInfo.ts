import { type z } from "astro:content";
import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Stats } from "node:fs";
import type { ObsidianWikiLinkSchema } from "../schemas";
import { isYAMLException, MarkdownError, type ErrorLocation } from "./errors";
import {
  entryToLink,
  entryToSlug,
  parseObsidianLinkField,
  parseObsidianText,
  resolveAssetIdByLink,
  type ObsidianContext
} from "./obsidian";

type Link = z.infer<typeof ObsidianWikiLinkSchema>;

function safeParseFrontmatter(source: string, id?: string) {
  try {
    return matter(source);
  } catch (err: any) {
    const markdownError = new MarkdownError({
      name: "MarkdownError",
      message: err.message,
      stack: err.stack,
      location: (id
        ? {
            file: id,
          }
        : undefined) as ErrorLocation,
    });

    if (isYAMLException(err)) {
      markdownError.setLocation({
        file: id,
        line: err.mark.line,
        column: err.mark.column,
      } as ErrorLocation);

      markdownError.setMessage(err.reason);
    }

    throw markdownError;
  }
}

export function getEntryInfo(
  contents: string,
  fileUrl: URL,
  entry: string,
  stats: Stats,
  context: ObsidianContext,
  logger: Console,
) {
  const { content, data, matter } = safeParseFrontmatter(
    contents,
    fileURLToPath(fileUrl)
  );

  // Object.entries(data).forEach(([k, v]) => {
  //   if (typeof v === 'string') {
  //   }
  // });

  // find h1 in content
  const h1InContent = content.match(/^# (.+)$/m)?.[0].replace('#', '').trim();

  data.title = data.title ?? h1InContent ?? path.basename(entry, path.extname(entry));
  data.permalink = entryToLink(entry, context, data.permalink ?? data.slug);
  data.description = data.description ?? data.excerpt;

  const [slug, language] = entryToSlug(entry, context, data.permalink ?? data.slug);
  data.slug = slug;

  // TODO: Figure out a better way to resolve Astro paths for assets

  if (data.image) {
    const assetId = resolveAssetIdByLink(data.image, context);
    data.image = `/${context.base}/${assetId}`;
  }

  if (data.cover) {
    const assetId = resolveAssetIdByLink(data.cover, context);
    data.cover = `/${context.base}/${assetId}`;
  }

  data.author = data.author ?? context.author;
  data.created = data.created ?? stats.ctime;
  data.updated = data.updated ?? stats.mtime;

  if (context.i18n) {
    data.language = entry.split(path.sep)?.[0] ?? context.defaultLocale;
  }

  const documentLinks: Link[] = [];

  if (context.options.wikilinkFields) {
    context.options.wikilinkFields.forEach((field) => {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          data[field] = data[field].map((link: string) => {
            const fieldLink = parseObsidianLinkField(link, context, logger, field);

            if (fieldLink) {
              documentLinks.push(fieldLink);
            }

            return fieldLink;
          }).filter(e => e !== null);
        } else {
          data[field] = parseObsidianLinkField(data[field], context, logger, field);

          if (data[field]) {
            documentLinks.push(data[field]);
          }
        }
      }
    });
  }

  const parsedBody= parseObsidianText(content, context, logger);
  
  const links = documentLinks.concat(parsedBody.links);
  data.links = links.filter(
    (l, i) => links?.findIndex((dl) => dl.href === l.href) === i
  );
  data.images = parsedBody.images;

  return {
    data,
    body: parsedBody.content,
    // slug: parsed.data.permalink ?? parsed.data.slug,
    rawData: matter,
  };
}
