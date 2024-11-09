import { slugify } from "./slugify";
import path from "node:path";

export type ObsidianContext = {
  author?: string;
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

  return context.i18n && language !== context.defaultLocale
    ? `/${language}/${context.baseUrl}/${slug}`
    : `/${context.baseUrl}/${slug}`;
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

export const parseObsidianLink = (
  linkText: string,
  context: ObsidianContext
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
    console.warn(`Could not find document from Obsidian link "${idHref}"`);
    return {
      title,
      href: `/404?entry=${slugify(idHref)}&collection=${context.baseUrl}`,
    };
  }

  const href = entryToLink(documentId, context);

  return { title, href };
};

export const parseObsidianText = (
  content: string,
  context: ObsidianContext
): { content: string; links: { title: string; href: string }[] } => {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: { title: string; href: string }[] = [];

  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [link, obsidianId] = match;

    const obsidianLink = parseObsidianLink(obsidianId as string, context);

    links.push(obsidianLink);

    // replace with link to the corresponding markdown file
    content = content.replace(
      link,
      `[${obsidianLink.title}](${obsidianLink.href})`
    );
  }

  return { content, links };
};
