import type { FrontmatterData } from "../utils/frontmatter";

export const description = (data: FrontmatterData) =>
  data.description ?? data.excerpt;
