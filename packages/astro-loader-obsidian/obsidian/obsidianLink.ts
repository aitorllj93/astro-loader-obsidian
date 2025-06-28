import type { AstroIntegrationLogger } from "astro";

import type { ObsidianLink } from "../schemas";
import { getDocumentFromLink, toUrl } from "./obsidianId";
import { slugify } from "./utils/slugify";

type ParseLinkOptions = {
  baseUrl: string;
  brokenLinksStrategy: 'warn' | 'label' | '404' | undefined;
  entry?: string;
  i18n: boolean | undefined;
  defaultLocale: string | undefined;
  logger: AstroIntegrationLogger;
}

export const parseLink = (
  linkText: string,
  files: string[],
  options: ParseLinkOptions,
): ObsidianLink => {
  let idHref = linkText;
  let title = linkText.split("/").slice(-1)[0] as string;

  if (linkText.includes("|")) {
    const [aliasHref, aliasTitle] = linkText.split("|");
    idHref = aliasHref as string;
    title = aliasTitle as string;
  }

  const documentId = getDocumentFromLink(idHref, files);

  if (!documentId) {
    const fallbackStrategy = options.brokenLinksStrategy;
    const errorMessage = `Could not find document from Obsidian link "${idHref}" at "${options.entry}"`;

    let href: string | null = null;

    if (fallbackStrategy === "warn") {
      options.logger.warn(errorMessage);
      href = idHref;
    } else if (fallbackStrategy === "404") {
      href = `/404?entry=${slugify(idHref)}&collection=${options.baseUrl}`;
    } else {
      options.logger.debug(errorMessage);
    }

    return {
      id: slugify(idHref),
      title,
      href,
    };
  }

  const href = toUrl(
    documentId,
    options.baseUrl,
    options.i18n,
    options.defaultLocale
  );

  return { id: slugify(idHref), title, href };
};