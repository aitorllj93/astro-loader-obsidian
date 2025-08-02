import type { AstroIntegrationLogger } from "astro";
import type { ObsidianContext } from "../types";
import type {ObsidianLink } from "../schemas";
import { parseWikilinks } from "./wikiLink";
import { parseWikitags } from "./wikiTag";

export const parseBody = (
  body: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger,
): { content: string; images: ObsidianLink[]; links: ObsidianLink[] } => {
  let content = body;
  const links: ObsidianLink[] = [];
  const images: ObsidianLink[] = [];

  const wikilinks = parseWikilinks(body, 'body', context, logger);

  for (const wikilink of wikilinks) {
    const hasTarget = typeof wikilink.link.href === "string";

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

    if (wikilink.link.type === 'document') {
      if (hasTarget) {
        links.push(wikilink.link);
      }

      // if (hasTarget && wikilink.link.isEmbedded) {
      //   // replace with embedding placeholder
      //   content = content.replace(
      //     wikilink.text,
      //     `$doc_emb::${wikilink.link.id}|${wikilink.link.href}|${wikilink.link.caption}`
      //   );
      // } else {
      //   // replace with link to the corresponding markdown file
      //   content = content.replace(
      //     wikilink.text,
      //     hasTarget
      //       ? `[${wikilink.link.title}](${wikilink.link.href})`
      //       : wikilink.link.title
      //   );
      // }
    }
  }

  if (context.options.parseTagsIntoLinks !== false) {
    const wikitags = parseWikitags(body, 'body', context, logger);

    for (const tag of wikitags) {
      links.push(tag.link);

      // replace with link to the corresponding markdown file
      content = content.replace(
        tag.text,
        `[${tag.text}](${tag.link.href})`
      );
    }
  }

  // remove h1 from content
  if (!("removeH1" in context.options) || context.options.removeH1 === true) {
    content = content.replace(/^# .+$/m, "");
  }

  return { content, images, links };
};
