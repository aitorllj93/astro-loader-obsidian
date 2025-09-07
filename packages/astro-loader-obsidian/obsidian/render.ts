import type { AstroIntegrationLogger } from "astro";
import type { DataStore } from "astro/loaders";

import type { ObsidianDocument, ObsidianLink } from "../schemas";
import type { Wikilink } from "./wikiLink";
import type { Wikitag } from "./wikiTag";
import type { StoreDocument } from "../types";

import { renderEmbed } from "./obsidianEmbeds";
import { renderImage } from "./obsidianImages";

import { parse, replaceOutsideDataCode } from "./utils/html";


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
        const href = wikilink.link.href as string;
        images.push(wikilink.link);
        const isAdded = rendered.metadata.imagePaths.indexOf(href) !== -1;

        if (!isAdded) {
          rendered.metadata.localImagePaths.push(href);
          rendered.metadata.imagePaths.push(href);
        }
      }

      let replacement: string | null = null;
        
      // TODO: Update code to include picture wrapper
      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        replacement = await renderImage(rendered, wikilink, logger);
      } else {
        replacement = `<a class="image-link" href="${wikilink.link.href}">${wikilink.link.title}</a>`;
      }

      const shouldWrapWithNextItem = [
        'figure-image-float-left',
        'figure-image-float-right'
      ].some(cls => replacement.includes(cls));

      // si tiene float-left o float-right, wrappear con el siguiente elemento
      await replaceOutsideDataCode(root, wikilink.text, replacement, shouldWrapWithNextItem);
    }

    if (wikilink.link.type === 'audio') {
      if (hasTarget) {
        audios.push(wikilink.link);
      }

      let replacement: string | null = null;

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        replacement = `<audio class="audio-embed" controls src="${wikilink.link.href}"></audio>`;
      } else {
        replacement = `<a class="audio-link" href="${wikilink.link.href}">${wikilink.link.title}</a>`
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
        replacement = `<a class="video-link" href="${wikilink.link.href}">${wikilink.link.title}</a>`
      }
    
      await replaceOutsideDataCode(root, wikilink.text, replacement);
    }

    if (wikilink.link.type === 'file') {
      if (hasTarget) {
        files.push(wikilink.link);
      }

      let replacement: string | null = null;

      if (hasTarget && wikilink.link.isEmbedded && wikilink.link.id) {
        if (wikilink.extension === '.svg') {
          replacement = `<div class="svg-embed"><svg viewBox="0 0 100 100"><image x="0" y="0" width="100%" height="100%" href=${wikilink.link.href} preserveAspectRatio="xMidYMid meet" /></svg></div>`;
        } else {
          replacement = `<iframe class="iframe-embed" src="${wikilink.link.href}"></iframe>`;
        }
      } else {
        replacement = `<a class="iframe-link" href="${wikilink.link.href}">${wikilink.link.title}</a>`
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
          `<a class="article-wikilink" href="${wikilink.link.href}">${wikilink.link.title}</a>` :
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
      `<a class="article-tag" href="${tag.link.href}">${tag.text}</a>` :
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