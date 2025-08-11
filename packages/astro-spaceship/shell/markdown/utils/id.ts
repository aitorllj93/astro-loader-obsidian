import { slug as githubSlug } from "github-slugger";
import path from "node:path";

const normalizeEntry = (text: string) => {
  return (
    text
      .normalize("NFKD")
      // Remove diacritics and combining marks
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
      .replace(/[\u0300-\u036f]/g, "")
      // Replace subscript numbers with regular numbers
      .replace(/₀/g, "0")
      .replace(/₁/g, "1")
      .replace(/₂/g, "2")
      .replace(/₃/g, "3")
      .replace(/₄/g, "4")
      .replace(/₅/g, "5")
      .replace(/₆/g, "6")
      .replace(/₇/g, "7")
      .replace(/₈/g, "8")
      .replace(/₉/g, "9")
      // Replace special characters with their ASCII equivalents
      .replace(/[ʰ]/g, "h")
      .replace(/[ʷ]/g, "w")
      .replace(/[éē]/g, "e")
      .replace(/[óō]/g, "o")
      .replace(/[íī]/g, "i")
      .replace(/[úū]/g, "u")
      .replace(/[áā]/g, "a")
      .replace(/[ḗ]/g, "e")
      .replace(/[*]/g, "")
  );
};

export function slugify(str: string, includeFileExt = false) {
  const extname = path.extname(str);
  const withoutFileExt = str.replace(new RegExp(`${extname}\$`), "");
  const rawSlugSegments = withoutFileExt.split(path.sep);

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(normalizeEntry(segment)))
    .join("/")
    .replace(/\/index$/, "");

  return includeFileExt ? `${slug}${extname}` : slug;
}

export const toSlug = (
  entry: string,
  i18n?: boolean,
  permalink?: string
): [string, string|undefined] => {
  let entrySlug = slugify(entry);
  let language: string | undefined;

  if (i18n) {
    const [entryLanguage, ...entryPath] = entry.split(path.sep);
    language = entryLanguage;
    entrySlug = slugify(entryPath.join("/"));
  }

  const slug = entrySlug;
  
  return [slug, language];
};

export const toUrl = (
  entry: string,
  baseUrl: string,
  i18n?: boolean,
  defaultLocale?: string,
  permalink?: string
): string => {
  const [slug, language] = toSlug(entry, i18n, permalink);
  const base = baseUrl.replace(/^\/+|\/+$/g, '');

  const urlParts = [base, slug].filter(p => p.length > 0 && p !== '/');

  if (i18n && language !== defaultLocale) {
    urlParts.unshift(language as string);
  }

  const pathname = urlParts.join("/");

  return pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
};