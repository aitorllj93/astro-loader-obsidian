import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isYAMLException, MarkdownError } from "./errors";
import {
  entryToLink,
  parseObsidianText,
  type ObsidianContext,
} from "./obsidian";
import type { Stats } from "node:fs";

function safeParseFrontmatter(source: string, id?: string) {
  try {
    return matter(source);
  } catch (err: any) {
    const markdownError = new MarkdownError({
      name: "MarkdownError",
      message: err.message,
      stack: err.stack,
      location: id
        ? {
            file: id,
          }
        : undefined,
    });

    if (isYAMLException(err)) {
      markdownError.setLocation({
        file: id,
        line: err.mark.line,
        column: err.mark.column,
      });

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
  context: ObsidianContext
) {
  const { content, data, matter } = safeParseFrontmatter(
    contents,
    fileURLToPath(fileUrl)
  );

  // Object.entries(data).forEach(([k, v]) => {
  //   if (typeof v === 'string') {
  //   }
  // });

  data.title = data.title ?? path.basename(entry, path.extname(entry));
  data.permalink = entryToLink(entry, context, data.permalink ?? data.slug);

  data.author = data.author ?? context.author;
  data.created = data.created ?? stats.ctime;
  data.updated = data.updated ?? stats.mtime;

  if (context.i18n) {
    data.language = entry.split(path.sep)?.[0] ?? context.defaultLocale;
  }

  const { content: body } = parseObsidianText(content, context);

  return {
    data,
    body,
    // slug: parsed.data.permalink ?? parsed.data.slug,
    rawData: matter,
  };
}
