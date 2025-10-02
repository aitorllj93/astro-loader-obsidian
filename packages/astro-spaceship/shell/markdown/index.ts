

import rehypeRewrite from "rehype-rewrite";
import remarkCodeExtra from "remark-code-extra";
import remarkMath from "remark-math";
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
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
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'append',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to this section'
        },
        content: {
          type: 'element',
          tagName: 'svg',
          properties: {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            className: ['anchor-icon'],
            ariaHidden: 'true'
          },
          children: [
            {
              type: 'element',
              tagName: 'g',
              properties: {
                fill: 'none',
                stroke: 'currentColor',
                strokeLinecap: 'round',
                strokeWidth: '1.5'
              },
              children: [
                {
                  type: 'element',
                  tagName: 'path',
                  properties: {
                    d: 'M10.046 14c-1.506-1.512-1.37-4.1.303-5.779l4.848-4.866c1.673-1.68 4.25-1.816 5.757-.305s1.37 4.1-.303 5.78l-2.424 2.433'
                  },
                  children: []
                },
                {
                  type: 'element',
                  tagName: 'path',
                  properties: {
                    d: 'M13.954 10c1.506 1.512 1.37 4.1-.303 5.779l-2.424 2.433l-2.424 2.433c-1.673 1.68-4.25 1.816-5.757.305s-1.37-4.1.303-5.78l2.424-2.433',
                    opacity: '0.5'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      }
    ],
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