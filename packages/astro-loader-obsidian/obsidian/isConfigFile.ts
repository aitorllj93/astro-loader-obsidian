import { OBSIDIAN_CONFIG_FOLDER } from "./constants";

export const isConfigFile = (file: string, baseDir: string) => {
  const fileUrl = new URL(file, baseDir);
  return fileUrl.pathname.includes(OBSIDIAN_CONFIG_FOLDER);
}
