import type { AstroIntegrationLogger } from "astro";
import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";
import { parseWikilinks } from "./wikiLink";

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
    
    if (!wikilink.isImage) {
      if (hasTarget) {
        links.push(wikilink.link);
      }

      // replace with link to the corresponding markdown file
      content = content.replace(
        wikilink.text,
        hasTarget
          ? `[${wikilink.link.title}](${wikilink.link.href})`
          : wikilink.link.title
      );
    } else {
      if (hasTarget) {
        images.push(wikilink.link); 
      }

      content = content.replace(
          wikilink.text,
          hasTarget
            ? `![${wikilink.link.title}](${wikilink.link.href})` :
            wikilink.link.title
        );
    }
  }

  // remove h1 from content
  if (!("removeH1" in context.options) || context.options.removeH1 === true) {
    content = content.replace(/^# .+$/m, "");
  }

  return { content, images, links };
};