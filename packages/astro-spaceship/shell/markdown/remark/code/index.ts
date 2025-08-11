

import type { Text } from "hast";
import { embed } from "./embed";
import { mapview } from "./mapview";
import { spoiler } from "./spoiler";
import { timeline } from "./timeline";

export const transformers = {
  'embed': embed,
  'mapview': mapview,
  'spoiler-markdown': spoiler,
  'timeline-labeled': timeline,
} as const;


const transform = (node: Text) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const lang = (node as any).lang as keyof typeof transformers;
  const transformer = lang ? transformers[lang] : undefined;

  return transformer?.(node) ?? null;
};

export default {
  transform,
}