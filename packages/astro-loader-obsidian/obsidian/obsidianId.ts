
import path from "node:path";

import { slugify } from "./utils/slugify";

const fileName = (str: string) => path.basename(str, path.extname(str));

// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
const ascii = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const asciiCompare = (str: string, that: string) => {
  return ascii(str) === (ascii(that));
}

const asciiInclude = (str: string, that: string) => {
  return ascii(str).includes(ascii(that));
}

const nameEquals = (str: string, that: string) => {
  return asciiCompare(
    fileName(str),
    fileName(that),
  );
}

const localeContains = (str: string, sub: string) => {
  if(sub==="") return true;
  if(!sub || !str.length) return false;
  const subStr = `${sub}`;
  if(subStr.length>str.length) return false;
  return asciiInclude(str, subStr);
}

export const matches = (id: string, thatId: string) => {
  return localeContains(id, thatId) && nameEquals(id, thatId);
}

const closest = (link: string) => (a: string, b: string) => {
    const aMismatch = link.replace(a.replace('.md', ''), "").length;
    const bMismatch = link.replace(b.replace('.md', ''), "").length;

    if (aMismatch === 0) {
      return -1;
    } 
    
    if (bMismatch === 0) {
      return 1;
    }

    return bMismatch - aMismatch;
  } 

export const getDocumentFromLink = (
  link: string,
  files: string[]
): string|undefined => {
  // return the most precise match
  const entries = files.filter(id => matches(id, link));

  // sort results by the length of the mismatch. The closest the match, the first
  return entries.sort(closest(link))?.[0];
};



export const getAssetFromLink = (
  link: string,
  assets: string[]
): string => {
  let linkStr = link;
  const regex = /(!)?\[\[([^\]]+?)\]\]/g // /\[\[(!)?([\w/]+)\]\]/g;

  const match = linkStr.matchAll(regex).next();

  if (match.value) {
    linkStr = match.value[2] as string;
  }

  // return the most precise match
  const matches = assets.filter((id) => id.includes(linkStr));
  return matches.sort((a, b) => {
    const aMismatch = linkStr.replace(a, "").length;
    const bMismatch = linkStr.replace(b, "").length;

    return bMismatch - aMismatch;
  })[0] as string;
};

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