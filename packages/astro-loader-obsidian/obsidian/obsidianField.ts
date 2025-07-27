import type { AstroIntegrationLogger } from "astro";

import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";
import { parseWikilinks } from "./wikiLink";

export const parseFieldStr = (
  text: string,
  source: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger,
): ObsidianLink => {
  if (typeof text !== "string") {
    return {
      title: text,
      href: null,
      isEmbedded: false,
      type: 'document',
    };
  }

  const wikilinks = parseWikilinks(text, source, context, logger);

  const fieldLink = wikilinks[0];

  return fieldLink?.link ?? {
    title: text,
    href: null,
    isEmbedded: false,
    type: 'document',
  };
};


export const parseFieldArr = (
  texts: string[],
  source: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger,
): ObsidianLink[] => {
  return texts.map(t => parseFieldStr(t, source, context, logger));
};