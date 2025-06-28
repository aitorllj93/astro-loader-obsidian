import type { ObsidianContext } from "../../types";

import { getAssetFromLink } from "../obsidianId";

export const image = (image: string, context: ObsidianContext) => {
  const assetId = getAssetFromLink(image, context.assets);
  return `/${context.base}/${assetId}`;
};
