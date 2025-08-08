

import remarkEmbedder from '@remark-embedder/core';
import remarkEmbedderOembed from '@remark-embedder/transformer-oembed';
import rehypeRewrite from "rehype-rewrite";
import remarkCodeExtra from "remark-code-extra";
import remarkMath from "remark-math";
import rehypeCallouts from 'rehype-callouts';
import rehypeMathjax from 'rehype-mathjax';


import rehypeRewriteConfig from "./rehype";
import remarkCodeExtraConfig from "./remark/code";
import type { AstroUserConfig } from 'astro';
import type { SpaceshipConfig } from '../../types';

export type MarkdownConfig = NonNullable<AstroUserConfig['markdown']>;

export default (
  websiteConfig: SpaceshipConfig,
  {
    remarkPlugins = [],
    rehypePlugins = [],
  }: MarkdownConfig = {}, 
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
    remarkMath,
    ...remarkPlugins,
  ],
  rehypePlugins: [
    rehypeCallouts,
    [
      rehypeRewrite,
      rehypeRewriteConfig,
    ],
    rehypeMathjax,
    ...rehypePlugins,
  ],
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
}) satisfies MarkdownConfig