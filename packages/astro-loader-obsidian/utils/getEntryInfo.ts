import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Stats } from "node:fs";
import { isYAMLException, MarkdownError, type ErrorLocation } from "./errors";
import {
  entryToLink,
  parseObsidianText,
  resolveAssetIdByLink,
  type ObsidianContext
} from "./obsidian";

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

  const { content: body, links, images } = parseObsidianText(content, context, logger);

  data.links = links;
  data.images = images;

  return {
    data,
    body,
    // slug: parsed.data.permalink ?? parsed.data.slug,
    rawData: matter,
  };
}
