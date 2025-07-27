import type { AstroIntegrationLogger } from "astro";

import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";

type Wikitag = {
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
  const regex = /(?<!\w)#([A-Za-z0-9/_-]+)/g;

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
        isEmbedded: false,
        type: 'tag',
        title: name ?? tagId,
        href: `/${baseUrl}/${tagId}`,
        source,
      },
      text,
    }
    
    tags.push(link);
  }

  return tags;
};
