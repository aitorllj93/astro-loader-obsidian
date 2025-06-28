import type { FrontmatterData } from "../utils/frontmatter";

import type { ObsidianContext } from "../../types";

export const author = (context: ObsidianContext, data: FrontmatterData) =>
  data.author ?? context.author;
