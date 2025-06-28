import path from "node:path";

import type { ObsidianContext } from "../../types";

export const language = (entry: string, context: ObsidianContext) =>
  context.i18n
    ? entry.split(path.sep)?.[0] ?? context.defaultLocale
    : undefined;
