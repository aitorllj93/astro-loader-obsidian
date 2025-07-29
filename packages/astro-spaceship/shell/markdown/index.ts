

import remarkEmbedder from '@remark-embedder/core';
import remarkEmbedderOembed from '@remark-embedder/transformer-oembed';
import rehypeRewrite from "rehype-rewrite";
import remarkCodeExtra from "remark-code-extra";
import remarkObsidianCallout from 'remark-obsidian-callout';

import rehypeRewriteConfig from "./rehype";
import remarkCodeExtraConfig from "./remark/code";
import type { AstroUserConfig } from 'astro';

type MarkdownConfig = NonNullable<AstroUserConfig['markdown']>;
type RemarkPlugin = NonNullable<MarkdownConfig['remarkPlugins']>[number];

export default {
  remarkPlugins: [
    (remarkObsidianCallout as RemarkPlugin), 
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [(remarkEmbedder as any).default, {
      transformers: [
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        [(remarkEmbedderOembed as any).default]
      ],
    }],
    [
      remarkCodeExtra,
      remarkCodeExtraConfig,
    ],
  ],
  rehypePlugins: [
    [
      rehypeRewrite,
      rehypeRewriteConfig,
    ],
  ],
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
} satisfies MarkdownConfig