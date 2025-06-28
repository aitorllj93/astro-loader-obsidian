import type { AstroIntegrationLogger } from "astro";

import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";
import { ALLOWED_IMAGE_EXTENSIONS } from "./constants";
import { parseLink } from "./obsidianLink";
import { parseImage } from "./obsidianImage";

type Wikilink = {
  isImage: boolean;
  text: string;
  link: ObsidianLink;
};

export const parseWikilinks = (
  content: string,
  source: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger
): Wikilink[] => {
  const links: Wikilink[] = [];
  const regex = /(!)?\[\[([^\]]+?)\]\]/g; // /\[\[(!)?([\w/]+)\]\]/g;
  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [text, isImageMatch, obsidianId] = match;

    const isImage = !!(
      isImageMatch &&
      obsidianId &&
      ALLOWED_IMAGE_EXTENSIONS.some((ext) => obsidianId.endsWith(ext))
    );

    if (!obsidianId) {
      links.push({
        text,
        link: {
          title: text,
          href: null,
        },
        isImage: false,
      });
      continue;
    }

    if (!isImage) {
      const link = parseLink(obsidianId, context.files, {
        baseUrl: context.baseUrl,
        brokenLinksStrategy: context.options.brokenLinksStrategy,
        defaultLocale: context.defaultLocale,
        entry: context.entry,
        i18n: context.i18n,
        logger,
      });
      link.source = source;

      links.push({
        link,
        isImage,
        text,
      });
    } else {
      const link = parseImage(obsidianId, context.assets, {
        baseUrl: context.base?.toString(),
        logger,
      });
      link.source = source;

      links.push({
        link,
        isImage,
        text,
      });
    }
  }

  return links;
};
