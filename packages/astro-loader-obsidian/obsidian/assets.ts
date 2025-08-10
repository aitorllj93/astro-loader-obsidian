import { dirname, join } from "node:path";
import { ALLOWED_IMAGE_EXTENSIONS } from "./constants";
import { slugify } from "./utils/slugify";
import { copyFile, mkdir } from "node:fs/promises";

export const isImage = (asset: string) => 
    ALLOWED_IMAGE_EXTENSIONS.some(ext => asset.includes(ext));

export const getAssetsPublicDir = (baseUrl: URL, outputUrl: URL) => {
  const vaultDir = baseUrl.pathname.split('/').filter(Boolean).at(-1);

  if (!vaultDir) {
    return outputUrl.toString();
  }

  const outputDir = join(outputUrl.pathname, vaultDir);

  return outputDir;
}

export const getAssetsPublicUrl = (baseUrl: URL, base: string) => {
  const vaultDir = baseUrl.pathname.split('/').filter(Boolean).at(-1);

  if (!vaultDir) {
    return base;
  }

  return join(base, vaultDir);
}

export const getAssetPublicPath = (asset: string, baseUrl: URL, outputUrl: URL) => {
  const publicDir = getAssetsPublicDir(baseUrl, outputUrl);

  return join(publicDir, slugify(asset, true));
}

export const getAssetPublicUrl = (asset: string, publicDir: string) => {
  return join(publicDir, slugify(asset, true));
}

export const exposeObsidianAsset = async (asset: string, baseUrl: URL, outputUrl: URL) => {
  if (isImage(asset)) {
    return;
  }

  const assetPath = join(baseUrl.pathname, asset);

  const publicPath = getAssetPublicPath(asset, baseUrl, outputUrl);
  const dirPath = dirname(publicPath);


  await mkdir(dirPath, { recursive: true });

  return copyFile(assetPath, publicPath);
}