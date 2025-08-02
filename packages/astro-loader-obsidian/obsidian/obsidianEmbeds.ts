
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import type { Element, ElementContent, Node, Root, RootContent } from "hast";

import type { StoreDocument } from "../types";
import type { ObsidianDocument } from "../schemas";
import type { Wikilink } from './wikiLink';
import type { AstroIntegrationLogger } from 'astro';

const isElement = (node: Node): node is Element => node.type === "element";

const getTextFromElement = (el: Element): string => {
  return el.children
    .filter(child => child.type === 'text')
    .map(child => child.value)
    .join('')
    .trim();
};


const getSectionFromRoot = (root: Root, sectionStart: string): RootContent[] => {
  const children = root.children;
  const result: RootContent[] = [];

  let capturing = false;
  let startLevel = 0;

  for (const node of children) {
    if (!isElement(node)) {
      if (capturing) result.push(node);
      continue;
    }

    const tag = node.tagName;
    const isHeading = /^h[1-6]$/.test(tag);
    const headingText = getTextFromElement(node);

    if (isHeading) {
      const level = Number.parseInt(tag.charAt(1));

      if (!capturing && headingText === sectionStart) {
        capturing = true;
        startLevel = level;
        result.push(node);
        continue;
      }

      if (capturing && level <= startLevel) {
        // Se encontró un nuevo heading de mismo nivel o superior → cortar
        break;
      }
    }

    if (capturing) result.push(node);
  }

  return result;
};

export const renderEmbed = async (htmlBody: string, link: Wikilink, document: StoreDocument<ObsidianDocument>, logger: AstroIntegrationLogger) => {
  const [_, section] = link.link.caption?.split('#') ?? '';

  if (!document) {
    logger.warn(`Embed file ${link.link.id} not found`);
    return htmlBody;
  }

  const root = fromHtml(document.rendered.html, { fragment: true });

  const children = section ? getSectionFromRoot(root, section) : root.children;

  const embed = toHtml([{
    type: 'element',
    tagName: 'div',
    properties: {
      class: 'file-embed'
    },
    children: [
      {
        type: 'element',
        tagName: 'a',
        properties: {
          class: 'file-embed-link',
          href: document.data.permalink,
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            children: [
              {
                type: 'text',
                value: 'Open Link'
              },
            ]
          },
        ]
      },
      !section && {
        type: 'element',
        tagName: 'h5',
        properties: {
          class: 'file-embed-title'
        },
        children: [
          {
            type: 'text',
            value: document.data.title,
          },
        ]
      },
      {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'file-embed-content'
        },
        children,
      }
    ].filter(Boolean) as ElementContent[]
  }]);

  return embed;
}