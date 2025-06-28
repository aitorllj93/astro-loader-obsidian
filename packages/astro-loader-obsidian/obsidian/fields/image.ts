import { dirname, relative } from 'node:path';

import type { ObsidianContext } from "../../types";

import { getAssetFromLink } from "../obsidianId";

export const image = (image: string, context: ObsidianContext) => {
  const assetId = getAssetFromLink(image, context.assets);

  const relativePath = relative(dirname(`/${context.entry}`), `/${assetId}`);

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
};
