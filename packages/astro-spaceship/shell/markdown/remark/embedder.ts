
import type { RemarkPlugins } from 'astro';

import remarkEmbedder, { type TransformerInfo } from '@remark-embedder/core';
import remarkEmbedderOembed from '@remark-embedder/transformer-oembed';

export default [
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  (remarkEmbedder as any).default, 
  {
    transformers: [
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      [(remarkEmbedderOembed as any).default]
    ],
    handleHTML(html: string, info: TransformerInfo) {
      const {url, transformer} = info
      if (
        transformer.name === '@remark-embedder/transformer-oembed' &&
        url.includes('youtube.com')
      ) {
        return `<div class="embed-youtube">${html}</div>`
      }
      return html
    }
  }
] as RemarkPlugins[number];