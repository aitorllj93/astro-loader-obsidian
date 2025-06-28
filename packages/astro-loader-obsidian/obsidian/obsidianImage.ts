import type { AstroIntegrationLogger } from "astro";

import type { ObsidianLink } from "../schemas";
import { getAssetFromLink } from "./obsidianId";
import { slugify } from "./utils/slugify";


type ParseImageOptions = {
  baseUrl: string | undefined;
  logger: AstroIntegrationLogger;
}

export const parseImage = (
  linkText: string,
  assets: string[],
  options: ParseImageOptions,
): ObsidianLink => {
  let idHref = linkText;
  let title = linkText.split("/").slice(-1)[0] as string;

  if (linkText.includes("|")) {
    const [aliasHref, aliasTitle] = linkText.split("|");
    idHref = aliasHref as string;
    title = aliasTitle as string;
  }

  const assetId = getAssetFromLink(idHref, assets);

  if (!assetId) {
    options.logger.warn(`Could not find image from Obsidian image "${idHref}"`);
    return {
      id: slugify(idHref),
      title,
      href: null,
    };
  }

  const href = ['__ASTRO_IMAGE_', options.baseUrl, assetId].filter(Boolean).join('/');

  return { id: slugify(idHref), title, href };
};