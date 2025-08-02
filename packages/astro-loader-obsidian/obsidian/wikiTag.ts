import type { AstroIntegrationLogger } from "astro";
import { join } from "node:path";

import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";
import { toUrl } from "./obsidianId";
import { slugify } from "./utils/slugify";

export type Wikitag = {
  text: string;
  link: ObsidianLink;
};

export const parseWikitags = (
  content: string,
  source: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger
): Wikitag[] => {
  const baseUrl = context.options.tagsUrl ?? 'tags';
  const tags: Wikitag[] = [];
  const regex = /(?<![\w:/])#([A-Za-z0-9/_-]+)/g;

  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [text, tagId] = match;

    if (!tagId) {
      tags.push({
        text,
        link: {
          isEmbedded: false,
          type: 'tag',
          title: text,
          href: null,
        },
      });
      continue;
    }

    const [_, name] = tagId.split('/');

    const link: Wikitag = {
      link: {
        id: slugify(tagId),
        isEmbedded: false,
        type: 'tag',
        title: name ?? tagId,
        href: toUrl(tagId, join(context.baseUrl, baseUrl), context.options.i18n, context.defaultLocale),
        source,
      },
      text,
    }
    
    tags.push(link);
  }

  return tags;
};
