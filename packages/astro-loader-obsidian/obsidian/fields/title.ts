import path from "node:path";

import type { FrontmatterData } from "../utils/frontmatter";

export const title = (
  entry: string,
  content: string,
  data: FrontmatterData
) => {
  if (data.title) {
    return data.title;
  }

  // find h1 in content
  const h1InContent = content
    .match(/^# (.+)$/m)?.[0]
    .replace("#", "")
    .trim();

  if (h1InContent) {
    return h1InContent;
  }

  return path.basename(entry, path.extname(entry));
};
