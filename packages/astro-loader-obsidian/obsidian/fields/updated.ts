import type { Stats } from "node:fs";

import type { FrontmatterData } from "../utils/frontmatter";

export const updated = (stats: Stats, data: FrontmatterData) =>
  data.updated ?? stats.mtime;
