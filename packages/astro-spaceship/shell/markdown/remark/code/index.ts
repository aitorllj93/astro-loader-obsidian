

import type { Text } from "hast";
import { embed } from "./embed";
import { spoiler } from "./spoiler";
import { timeline } from "./timeline";

export const transformers = {
  'spoiler-markdown': spoiler,
  'timeline-labeled': timeline,
  'embed': embed,
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