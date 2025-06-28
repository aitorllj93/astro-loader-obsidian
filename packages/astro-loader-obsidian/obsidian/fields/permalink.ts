import type { FrontmatterData } from "../utils/frontmatter";

import type { ObsidianContext } from "../../types";

import { toUrl } from "../obsidianId";

export const permalink = (
  entry: string,
  context: ObsidianContext,
  data: FrontmatterData
) =>
  toUrl(
    entry,
    context.baseUrl,
    context.i18n,
    context.defaultLocale,
    data.permalink ?? data.slug
  );
