import type { AstroIntegrationLogger } from "astro";
import { parse, type HTMLElement, type TextNode, type Node } from 'node-html-parser';

import type { Wikilink } from "./wikiLink";
import type { DataStore } from "astro/loaders";
import { renderEmbed } from "./obsidianEmbeds";
import type { ObsidianDocument, ObsidianLink } from "../schemas";
import type { Wikitag } from "./wikiTag";
import type { StoreDocument } from "../types";

const replaceOutsideDataCode = async (
  root: HTMLElement,
  wikilinkText: string,
  replacementHTML: string
) => {
  const textNodes: TextNode[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === 3) {
      // TextNode
      if (!isInsideDataCode(node)) {
        textNodes.push(node as TextNode);
      }
    } else {
      const element = node as HTMLElement;
      // Recorre hijos (no inspeccionamos atributos, porque queremos evitarlos)
      element.childNodes.forEach(walk);
    }
  };

  const isInsideDataCode = (node: Node): boolean => {
    let current: HTMLElement | null = node.parentNode as HTMLElement;
    while (current) {
      const dataCode = current.getAttribute?.('data-code');
      if (dataCode?.includes(wikilinkText)) {
        return true;
      }
      current = current.parentNode as HTMLElement;
    }
    return false;
  };

  walk(root);

  for (const textNode of textNodes) {
    const replaced = textNode.rawText.replaceAll(wikilinkText, replacementHTML);
    if (replaced !== textNode.rawText) {
      textNode.rawText = replaced;
    }
  }
};


export const renderObsidian = async (
  rendered: StoreDocument['rendered'],
  wikilinks: Wikilink[],
  wikitags: Wikitag[],
  store: DataStore,
  logger: AstroIntegrationLogger,
): Promise<{
  content: string;
  images: ObsidianLink[];
  links: ObsidianLink[];
  audios: ObsidianLink[];
  videos: ObsidianLink[];
  files: ObsidianLink[];
}> => {
  let content = rendered.html;
  const links: ObsidianLink[] = [];
  const images: ObsidianLink[] = [];
  const audios: ObsidianLink[] = [];
  const videos: ObsidianLink[] = [];
  const files: ObsidianLink[] = [];

  const root = parse(content);

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

    if (wikilink.link.type === 'audio') {
      if (hasTarget) {
        audios.push(wikilink.link);
      }

      let replacement: string | null = null;

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        replacement = `<audio class="audio-embed" controls src="${wikilink.link.href}"></audio>`;
      } else {
        replacement = `<a class="audio-link" href=${wikilink.link.href}>${wikilink.link.title}</a>`
      }
    
      await replaceOutsideDataCode(root, wikilink.text, replacement);
    }

    if (wikilink.link.type === 'video') {
      if (hasTarget) {
        videos.push(wikilink.link);
      }

      let replacement: string | null = null;

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        replacement = `<video class="video-embed" controls src="${wikilink.link.href}"></video>`;
      } else {
        replacement = `<a class="video-link" href=${wikilink.link.href}>${wikilink.link.title}</a>`
      }
    
      await replaceOutsideDataCode(root, wikilink.text, replacement);
    }

    if (wikilink.link.type === 'file') {
      if (hasTarget) {
        files.push(wikilink.link);
      }

      let replacement: string | null = null;

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        replacement = `<iframe class="iframe-embed" src="${wikilink.link.href}"></iframe>`;
      } else {
        replacement = `<a class="iframe-link" href=${wikilink.link.href}>${wikilink.link.title}</a>`
      }
    
      await replaceOutsideDataCode(root, wikilink.text, replacement);
    }


    if (wikilink.link.type === 'document') {
      if (hasTarget) {
        links.push(wikilink.link);
      }

      let replacement: string | null = null;

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        const document = store.get(wikilink.link.id) as StoreDocument<ObsidianDocument> | undefined;

        if (!document) {
          logger.warn(`Embed document "${wikilink.link.id}" is unavailable`);
        }

        replacement = document
          ? await renderEmbed(content, wikilink, document, logger)
          : `<span class="article-wikilink-embed">${wikilink.link.title}</span>`;
      } else {
        replacement = hasTarget ?
          `<a class="article-wikilink" href=${wikilink.link.href}>${wikilink.link.title}</a>` :
          `<span class="article-wikilink">${wikilink.link.title}</span>`
      }

      await replaceOutsideDataCode(root, wikilink.text, replacement);

      const heading = rendered.metadata.headings.find(h => h.text === wikilink.text);

      if (heading) {
        heading.text = wikilink.link.title;
      }
    }
  }

  for (const tag of wikitags) {
    links.push(tag.link);
    const hasTarget = typeof tag.link.href === "string";

    await replaceOutsideDataCode(root, tag.text, hasTarget ?
      `<a class="article-tag" href=${tag.link.href}>${tag.text}</a>` :
      `<span class="article-tag">${tag.text}</span>`);
  }

  content = root.toString();

  return {
    content,
    images,
    links,
    audios,
    videos,
    files,
  };

}