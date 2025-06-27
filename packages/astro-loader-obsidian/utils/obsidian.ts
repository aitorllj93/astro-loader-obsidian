import type { z } from "astro:content";
import path from "node:path";

import type { ObsidianWikiLinkSchema } from "../schemas";
import type { ObsidianContext } from "../types";
import { slugify } from "./slugify";

type Link = z.infer<typeof ObsidianWikiLinkSchema>;

const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".avif",
  ".tiff",
  ".bmp",
  ".ico",
];

const localeContains = (str: string, sub: string) => {
  if(sub==="") return true;
  if(!sub || !str.length) return false;
  sub = `${sub}`;
  if(sub.length>str.length) return false;
  const ascii = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return ascii(str).includes(ascii(sub));
}


export type { ObsidianContext };

export const entryToSlug = (
  entry: string,
  context: ObsidianContext,
  permalink?: string
): [string, string|undefined] => {
  let entrySlug = slugify(entry);
  let language: string | undefined;

  if (context.i18n) {
    const [entryLanguage, ...entryPath] = entry.split(path.sep);
    language = entryLanguage;
    entrySlug = slugify(entryPath.join("/"));
  }

  const slug = entrySlug;
  
  return [slug, language];
};

export const entryToLink = (
  entry: string,
  context: ObsidianContext,
  permalink?: string
): string => {
  const [slug, language] = entryToSlug(entry, context, permalink);

  const urlParts = [context.baseUrl, slug].filter(p => p.length > 0 && p !== '/');

  if (context.i18n && language !== context.defaultLocale) {
    urlParts.unshift(language as string);
  }

  const pathname = urlParts.join("/");

  return pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
};

export const resolveDocumentIdByLink = (
  link: string,
  context: ObsidianContext
): string => {
  // return the most precise match
  const matches = context.files.filter((id) => localeContains(id, link) && 
    path.basename(id, path.extname(id)) === path.basename(link, path.extname(link))
  );
  // sort results by the length of the mismatch. The closest the match, the first
  const sortedMatches = matches.sort((a, b) => {
    const aMismatch = link.replace(a.replace('.md', ''), "").length;
    const bMismatch = link.replace(b.replace('.md', ''), "").length;

    if (aMismatch === 0) {
      return -1;
    } 
    
    if (bMismatch === 0) {
      return 1;
    }

    return bMismatch - aMismatch;
  });

  return sortedMatches?.[0] as string;
};

export const resolveAssetIdByLink = (
  link: string,
  context: ObsidianContext
): string => {
  const regex = /(!)?\[\[([^\]]+?)\]\]/g // /\[\[(!)?([\w/]+)\]\]/g;

  const match = link.matchAll(regex).next();

  if (match.value) {
    link = match.value[2] as string;
  }

  // return the most precise match
  const matches = context.assets.filter((id) => id.includes(link));
  return matches.sort((a, b) => {
    const aMismatch = link.replace(a, "").length;
    const bMismatch = link.replace(b, "").length;

    return bMismatch - aMismatch;
  })[0] as string;
};

export const parseObsidianLink = (
  linkText: string,
  context: ObsidianContext,
  logger: Console,
  source?: string,
): Link => {
  let idHref = linkText;
  let title = linkText.split("/").slice(-1)[0] as string;

  if (linkText.includes("|")) {
    const [aliasHref, aliasTitle] = linkText.split("|");
    idHref = aliasHref as string;
    title = aliasTitle as string;
  }

  const documentId = resolveDocumentIdByLink(idHref, context);

  if (!documentId) {
    logger.warn(`Could not find document from Obsidian link "${idHref}" at "${context.entry}"`);

    const strategy = context.options.brokenLinksStrategy;

    let href: string|null = null;

    if (strategy === 'warn') {
      href = idHref;
    } else if (strategy === '404') {
      href = `/404?entry=${slugify(idHref)}&collection=${context.baseUrl}`
    }

    return {
      id: slugify(idHref),
      title,
      href,
      source,
    };
  }

  const href = entryToLink(documentId, context);

  return { id: slugify(idHref), title, href, source };
};

export const parseObsidianImage = (
  linkText: string,
  context: ObsidianContext,
  logger: Console,
  source?: string,
): Link  => {
  let idHref = linkText;
  let title = linkText.split("/").slice(-1)[0] as string;

  if (linkText.includes("|")) {
    const [aliasHref, aliasTitle] = linkText.split("|");
    idHref = aliasHref as string;
    title = aliasTitle as string;
  }

  const assetId = resolveAssetIdByLink(idHref, context);

  if (!assetId) {
    logger.warn(`Could not find image from Obsidian image "${idHref}"`);
    return {
      id: slugify(idHref),
      title,
      href: null,
      source,
    };
  }

  const href = `__ASTRO_IMAGE_/${context.base}/${assetId}`;

  return { id: slugify(idHref), title, href, source, };
};

export const parseObsidianLinkField = (
  text: string,
  context: ObsidianContext,
  logger: Console,
  source?: string,
): Link => {
  const regex = /(!)?\[\[([^\]]+?)\]\]/g // /\[\[(!)?([\w/]+)\]\]/g;

  const match = text?.matchAll(regex).next();
  if (match.value) {
    const [link, isImageMatch, obsidianId] = match.value;
    const isImage = isImageMatch && obsidianId && ALLOWED_IMAGE_EXTENSIONS.some(ext => obsidianId.endsWith(ext));
    if (!isImage) {
      return parseObsidianLink(obsidianId as string, context, logger, source);
    }
    return parseObsidianImage(obsidianId as string, context, logger, source);
  }

  return {
    title: text,
    href: null,
  };
}

export const parseObsidianText = (
  content: string,
  context: ObsidianContext,
  logger: Console
): { content: string;  images: Link[]; links: Link[] } => {
  const regex = /(!)?\[\[([^\]]+?)\]\]/g // /\[\[(!)?([\w/]+)\]\]/g;
  const links: Link[] = [];
  const images: Link[] = [];

  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [link, isImageMatch, obsidianId] = match;

    const isImage = isImageMatch && obsidianId && ALLOWED_IMAGE_EXTENSIONS.some(ext => obsidianId.endsWith(ext));

    if (!isImage) {
      const obsidianLink = parseObsidianLink(obsidianId as string, context, logger, 'body');

      if (typeof obsidianLink.href === 'string') {
        links.push(obsidianLink);
      }

      // replace with link to the corresponding markdown file
      content = content.replace(
        link,
        typeof obsidianLink.href ==='string'
            ? `[${obsidianLink.title}](${obsidianLink.href})`
            : obsidianLink.title
      );
    } else {
      const obsidianImage = parseObsidianImage(obsidianId as string, context, logger, 'body');

      if (obsidianImage.href !== null) {
        images.push(obsidianImage);
        // replace with link to the corresponding markdown file
        content = content.replace(
          link,
          `![${obsidianImage.title}](${obsidianImage.href})`
        );
      } else {
        content = content.replace(link, obsidianImage.title);
      }

    }
  }

  // remove h1 from content
  if (!('removeH1' in context.options) || context.options.removeH1 === true) {
    content = content.replace(/^# .+$/m, "");
  }

  return { content, images, links };
};
