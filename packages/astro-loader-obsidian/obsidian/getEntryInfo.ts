import { fileURLToPath } from "node:url";
import type { Stats } from "node:fs";
import type { AstroIntegrationLogger } from "astro";

import type { ObsidianContext } from "../types";
import type { ObsidianLink, ObsidianDocument } from "../schemas";

import { safeParseFrontmatter } from "./utils/frontmatter";

import { parseBody } from "./obsidianBody";
import { parseFieldStr, parseFieldArr } from "./obsidianField";
import {
  author,
  created,
  description,
  image,
  language,
  permalink,
  slug,
  title,
  updated,
} from "./fields";
import { zettel } from "./fields/zettel";

export function getEntryInfo(
  contents: string,
  fileUrl: URL,
  entry: string,
  stats: Stats,
  context: ObsidianContext,
  logger: AstroIntegrationLogger
): {
  body: string;
  data: Partial<ObsidianDocument>;
  rawData: string;
} {
  const parsed = safeParseFrontmatter(
    contents,
    fileURLToPath(fileUrl)
  );

  const { matter, content } = parsed;
  const data = parsed.data as Partial<ObsidianDocument> & Record<string, unknown>;

  if (context.options.zettelkasten && context.options.zettelkasten?.enabled !== false) {
    const { zettelId, zettelIdMeta, title } = zettel(entry, context, data);

    if (zettelId) {
      data.zettelkasten = {
        id: zettelId,
        meta: zettelIdMeta,
      }
      data.title = data.title ?? title;
    }
  }
 
  data.title = title(entry, content, data);
  data.permalink = permalink(entry, context, data);
  data.description = description(data);
  data.slug = slug(entry, context, data);
  data.author = author(context, data);
  data.created = created(stats, data);
  data.updated = updated(stats, data);
  data.language = language(entry, context);

  // TODO: Figure out a better way to resolve Astro paths for assets
  if (data.image) {
    data.image = image(data.image, context);
  }
  if (data.cover) {
    data.cover = image(data.cover, context);
  }


  const documentLinks: ObsidianLink[] = [];

  if (context.options.wikilinkFields) {
    for (const field of context.options.wikilinkFields) {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          const link = parseFieldArr(data[field], field, context, logger);
          data[field] = link;
          documentLinks.push(...link);
        } else {
          const link = parseFieldStr(data[field] as string, field, context, logger);
          data[field] = link;
          documentLinks.push(link);
        }
      }
    }
  }

  const parsedBody = parseBody(content, context, logger);

  const links = documentLinks.concat(parsedBody.links);
  data.links = links.filter(
    (l, i) => links?.findIndex((dl) => dl.href === l.href) === i
  );
  data.images = parsedBody.images as { title: string; href: string }[];

  return {
    data,
    body: parsedBody.content,
    // slug: parsed.data.permalink ?? parsed.data.slug,
    rawData: matter,
  };
}
