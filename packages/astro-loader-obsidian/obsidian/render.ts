import type { AstroIntegrationLogger } from "astro";
import type { Wikilink } from "./wikiLink";
import type { DataStore } from "astro/loaders";
import { renderEmbed } from "./obsidianEmbeds";
import type { ObsidianDocument, ObsidianLink } from "../schemas";
import type { Wikitag } from "./wikiTag";
import type { StoreDocument } from "../types";


export const renderObsidian = async (
  htmlBody: string, 
  wikilinks: Wikilink[],
  wikitags: Wikitag[],
  store: DataStore, 
  logger: AstroIntegrationLogger
) => {
  let content = htmlBody;
  const links: ObsidianLink[] = [];
  const images: ObsidianLink[] = [];

  for (const wikilink of wikilinks) {
    const hasTarget = typeof wikilink.link.href === "string";

    if (wikilink.link.type === 'image') {
      if (hasTarget) {
        images.push(wikilink.link); 
      }

      // TODO: enable this if possible
      // content = content.replace(
      //   wikilink.text,
      //   hasTarget
      //     ? `![${wikilink.link.caption ?? wikilink.link.title}](${wikilink.link.href})` :
      //     wikilink.link.title
      // );
    }

    if (wikilink.link.type === 'document') {
      if (hasTarget) {
        links.push(wikilink.link);
      }

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        const document = store.get(wikilink.link.id) as StoreDocument<ObsidianDocument>|undefined;

        if (!document) {
          logger.warn(`Embed document "${wikilink.link.id}" is unavailable`);
        }

        content = content.replace(
          wikilink.text,
          document ?
            await renderEmbed(content, wikilink, document, logger) :
            `<span class="article-wikilink-embed">${wikilink.link.title}</span>`
        );
      } else {
        content = content.replace(
          wikilink.text,
          hasTarget ? 
            `<a class="article-wikilink" href=${wikilink.link.href}>${wikilink.link.title}</a>` :
            `<span class="article-wikilink">${wikilink.link.title}</span>`
        );
      }
    }
  }

  for (const tag of wikitags) {
    links.push(tag.link);
    const hasTarget = typeof tag.link.href === "string";

    content = content.replace(
      tag.text,
      hasTarget ? 
        `<a class="article-tag" href=${tag.link.href}>${tag.text}</a>` :
        `<span class="article-tag">${tag.text}</span>`
    );
  }

  return {
    content,
    images,
    links,
  };

}