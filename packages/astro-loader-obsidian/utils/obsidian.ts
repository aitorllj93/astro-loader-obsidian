import path from "node:path";
import { slugify } from "./slugify";

export type ObsidianContext = {
  author?: string;
  assets: string[];
  files: string[];
  baseUrl: string;
  i18n?: boolean;
  defaultLocale?: string;
};

export const entryToLink = (
  entry: string,
  context: ObsidianContext,
  permalink?: string
): string => {
  let entrySlug = slugify(entry);
  let language: string | undefined;

  if (context.i18n) {
    const [entryLanguage, ...entryPath] = entry.split(path.sep);
    language = entryLanguage;
    entrySlug = slugify(entryPath.join("/"));
  }

  const slug = permalink ?? entrySlug;

  const urlParts = [context.baseUrl, slug].filter(Boolean);

  if (context.i18n && language !== context.defaultLocale) {
    urlParts.unshift(language as string);
  }

  return `/${urlParts.join('/')}`;
};

export const resolveDocumentIdByLink = (
  link: string,
  context: ObsidianContext
): string => {
  // return the most precise match
  const matches = context.files.filter((id) => id.includes(link));
  return matches.sort((a, b) => {
    const aMismatch = link.replace(a, "").length;
    const bMismatch = link.replace(b, "").length;

    return bMismatch - aMismatch;
  })[0] as string;
};

export const resolveAssetIdByLink = (
  link: string,
  context: ObsidianContext
): string => {
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
): { title: string; href: string } => {
  let idHref = linkText;
  let title = linkText.split("/").slice(-1)[0] as string;

  if (linkText.includes("|")) {
    const [aliasHref, aliasTitle] = linkText.split("|");
    idHref = aliasHref as string;
    title = aliasTitle as string;
  }

  const documentId = resolveDocumentIdByLink(idHref, context);

  if (!documentId) {
    logger.warn(`Could not find document from Obsidian link "${idHref}"`);
    return {
      title,
      href: `/404?entry=${slugify(idHref)}&collection=${context.baseUrl}`,
    };
  }

  const href = entryToLink(documentId, context);

  return { title, href };
};

export const parseObsidianImage = (
  linkText: string,
  context: ObsidianContext,
  logger: Console,
): { title: string; href: string } => {
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
      title,
      href: `/404?entry=${slugify(idHref)}&collection=${context.baseUrl}`,
    };
  }

  const href = `__ASTRO_IMAGE_/src/content/vault/${assetId}`;

  return { title, href };
};

export const parseObsidianText = (
  content: string,
  context: ObsidianContext,
  logger: Console
): { content: string;  images: { title: string; href: string }[]; links: { title: string; href: string }[] } => {
  const regex = /(!)?\[\[([^\]]+?)\]\]/g // /\[\[(!)?([\w/]+)\]\]/g;
  const links: { title: string; href: string }[] = [];
  const images: { title: string; href: string }[] = [];

  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [link, isImage, obsidianId] = match;

    if (!isImage) {
      const obsidianLink = parseObsidianLink(obsidianId as string, context, logger);

      links.push(obsidianLink);

      // replace with link to the corresponding markdown file
      content = content.replace(
        link,
        `[${obsidianLink.title}](${obsidianLink.href})`
      );
    } else {
      const obsidianImage = parseObsidianImage(obsidianId as string, context, logger);

      images.push(obsidianImage);

      // replace with link to the corresponding markdown file
      content = content.replace(
        link,
        `![${obsidianImage.title}](${obsidianImage.href})`
      );
    }
  }

  // remove h1 from content
  content = content.replace(/^# .+$/m, "");

  return { content, images, links };
};
