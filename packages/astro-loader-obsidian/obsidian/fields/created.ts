import type { Stats } from "node:fs";

import type { FrontmatterData } from "../utils/frontmatter";

export const created = (stats: Stats, data: FrontmatterData) =>
  data.created ?? stats.ctime;
