import { dirname, relative } from 'node:path';

import type { ObsidianContext } from "../../types";

import { getAssetFromLink } from "../obsidianId";

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;


export const image = (image: string, context: ObsidianContext) => {
  const isUrl = image.match(URL_REGEX);

  if (isUrl) {
    return image;
  }

  const assetId = getAssetFromLink(image, context.assets);

  if (!assetId) {
    return undefined;
  }

  const relativePath = relative(dirname(`/${context.entry}`), `/${assetId}`);

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
};
