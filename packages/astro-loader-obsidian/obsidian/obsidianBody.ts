import type { AstroIntegrationLogger } from "astro";
import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";
import { parseWikilinks, type Wikilink } from "./wikiLink";
import { parseWikitags, type Wikitag } from "./wikiTag";

export const parseBody = (
  body: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger,
): {
  content: string;
  audios: ObsidianLink[];
  files: ObsidianLink[];
  images: ObsidianLink[];
  links: ObsidianLink[];
  wikilinks: Wikilink[];
  wikitags: Wikitag[];
} => {
  let content = body;
  const links: ObsidianLink[] = [];
  const images: ObsidianLink[] = [];
  const audios: ObsidianLink[] = [];
  const files: ObsidianLink[] = [];

  const wikilinks = parseWikilinks(body, 'body', context, logger);
  let wikitags: Wikitag[] = [];

  for (const wikilink of wikilinks) {
    const hasTarget = typeof wikilink.link.href === "string";

    // TODO: Check if it's possible to move this to post processing layer
    if (wikilink.link.type === 'image') {
      if (hasTarget) {
        images.push(wikilink.link);
      }

      content = content.replace(
        wikilink.text,
        hasTarget
          ? `![${wikilink.link.caption ?? wikilink.link.title}](${wikilink.link.href})` :
          wikilink.link.title
      );
    }

    if (wikilink.link.type === 'audio') {
      if (hasTarget) {
        audios.push(wikilink.link);
      }
    }

    if (wikilink.link.type === 'file') {
      if (hasTarget) {
        files.push(wikilink.link);
      }
    }
  }

  if (context.options.parseTagsIntoLinks !== false) {
    wikitags = parseWikitags(body, 'body', context, logger);
  }

  // remove h1 from content
  if (!("removeH1" in context.options) || context.options.removeH1 === true) {
    content = content.replace(/^# .+$/m, "");
  }

  return { content, audios, files, images, links, wikilinks, wikitags };
};
