import type { AstroIntegrationLogger } from "astro";
import type { ObsidianContext, StoreDocument } from "../types";
import type { ObsidianDocument, ObsidianLink } from "../schemas";
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

      if (hasTarget && wikilink.link.isEmbedded) {
        // replace with embedding placeholder
        content = content.replace(
          wikilink.text,
          `$doc_emb::${wikilink.link.id}`
        );
      } else {
        // replace with link to the corresponding markdown file
        content = content.replace(
          wikilink.text,
          hasTarget
            ? `[${wikilink.link.title}](${wikilink.link.href})`
            : wikilink.link.title
        );
      }
    }
  }

  if (context.options.parseTagsIntoLinks !== false) {
    const wikitags = parseWikitags(body, 'body', context, logger);

    for (const tag of wikitags) {
      links.push(tag.link);

      // replace with link to the corresponding markdown file
      content = content.replace(
        tag.text,
        `[${tag.link.title}](${tag.link.href})`
      );
    }
  }

  // remove h1 from content
  if (!("removeH1" in context.options) || context.options.removeH1 === true) {
    content = content.replace(/^# .+$/m, "");
  }

  return { content, images, links };
};

export const injectEmbeds = (body: string, documents: StoreDocument<ObsidianDocument>[]) => {
  const regex = /\$doc_emb::([a-zA-Z0-9/_-]+)/g;

  const matches = body.matchAll(regex);

  let result = body;

  for (const match of matches) {
    const fullMatch = match[0]; 
    const id = match[1];
    const document = documents.find(d => d.id === id);

    if (!document) {
      continue;
    }

    const replacement = `
\`\`\`$doc_emb
---
id: ${document.id}
title: ${document.data.title}
href: ${document.data.permalink}
---

${document.rendered.html}
\`\`\`\
`;

    result = result.split(fullMatch).join(replacement);
  }

  return result;
}