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

/**
 * Check if a position in the content is inside an HTML tag
 */
const isInsideHtmlTag = (content: string, matchIndex: number): boolean => {
  // Look backward to find the nearest < and >
  const beforeMatch = content.substring(0, matchIndex);
  const lastOpenTag = beforeMatch.lastIndexOf('<');
  const lastCloseTag = beforeMatch.lastIndexOf('>');

  // If we found an open tag and it's after the last close tag (or no close tag exists),
  // then we're inside an HTML tag
  return lastOpenTag > lastCloseTag;
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
    const matchIndex = match.index ?? 0;

    // Skip if the match is inside an HTML tag
    if (isInsideHtmlTag(content, matchIndex)) {
      continue;
    }

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
