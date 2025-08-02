

import remarkEmbedder from '@remark-embedder/core';
import remarkEmbedderOembed from '@remark-embedder/transformer-oembed';
import rehypeRewrite from "rehype-rewrite";
import remarkCodeExtra from "remark-code-extra";
import rehypeCallouts from 'rehype-callouts';


import rehypeRewriteConfig from "./rehype";
import remarkCodeExtraConfig from "./remark/code";
import type { AstroUserConfig } from 'astro';
import type { SpaceshipConfig } from '../../types';

type MarkdownConfig = NonNullable<AstroUserConfig['markdown']>;

export default (
  websiteConfig: SpaceshipConfig
) => ({
  remarkPlugins: [
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
    rehypeCallouts,
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
}) satisfies MarkdownConfig