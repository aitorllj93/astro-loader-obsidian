import type { FrontmatterData } from "../utils/frontmatter";

import type { ObsidianContext } from "../../types";

import { toSlug } from "../obsidianId";

export const slug = (
  entry: string,
  context: ObsidianContext,
  data: FrontmatterData
) => toSlug(entry, context.i18n, data.permalink ?? data.slug)[0];
