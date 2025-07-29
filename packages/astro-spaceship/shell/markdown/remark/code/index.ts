

import type { Text } from "hast";
import { docEmb } from "./doc_emb";
import { embed } from "./embed";
import { spoiler } from "./spoiler";
import { timeline } from "./timeline";

const transformers = {
  'spoiler-markdown': spoiler,
  'timeline-labeled': timeline,
  'embed': embed,
  '$doc_emb': docEmb,
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