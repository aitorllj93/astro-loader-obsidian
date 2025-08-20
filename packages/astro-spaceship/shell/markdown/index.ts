

import rehypeRewrite from "rehype-rewrite";
import remarkCodeExtra from "remark-code-extra";
import remarkMath from "remark-math";
import rehypeCallouts from 'rehype-callouts';
import rehypeMathjax from 'rehype-mathjax';
import rehypeMermaid from 'rehype-mermaid';


import rehypeRewriteConfig from "./rehype";
import remarkCodeExtraConfig from "./remark/code";
import remarkEmbedder from "./remark/embedder";
import remarkComments from './remark/comments';

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
    remarkEmbedder,
    [
      remarkCodeExtra,
      remarkCodeExtraConfig,
    ],
    remarkComments,
    remarkMath,
    ...remarkPlugins,
  ],
  rehypePlugins: [
    [
      rehypeCallouts,
      {
        callouts: {
          details: {
            title: '',
            indicator: '',
          }
        }
      }
    ],
    [
      rehypeRewrite,
      rehypeRewriteConfig,
    ],
    rehypeMathjax,
    rehypeMermaid,
    ...rehypePlugins,
  ],
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
}) satisfies MarkdownConfig