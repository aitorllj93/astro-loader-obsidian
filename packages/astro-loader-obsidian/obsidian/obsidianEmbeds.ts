
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import type { Element, ElementContent, Node, Root, RootContent, Parent } from "hast";

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


const collectSection = (parent: Parent, sectionStart: string): RootContent[] | null => {
  const { children } = parent;
  const result: RootContent[] = [];

  let capturing = false;
  let startLevel = 0;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];

    if (!node){
      continue;
    }

    // --- si ya estamos capturando, añadimos hasta que aparezca corte
    if (capturing) {
      if (isElement(node)) {
        const tag = node.tagName;
        if (/^h[1-6]$/i.test(tag)) {
          const level = Number.parseInt(tag.charAt(1), 10);
          if (level <= startLevel) break; // corte en mismo nivel o superior
        }
      }
      result.push(node);
      continue;
    }

    // --- aún no estamos capturando: ¿es el heading de inicio?
    if (isElement(node)) {
      const tag = node.tagName;
      if (/^h[1-6]$/i.test(tag)) {
        const headingText = getTextFromElement(node);
        if (headingText === sectionStart) {
          startLevel = Number.parseInt(tag.charAt(1), 10);
          capturing = true;
          result.push(node); // incluir el propio heading
          continue;
        }
      }

      // Buscar recursivamente dentro de este elemento
      const deep = collectSection(node as unknown as Parent, sectionStart);
      if (deep?.length) return deep;
    }
    // nodos no-element no disparan nada mientras no capturamos
  }

  return capturing ? result : null;
}


const getSectionFromRoot = (root: Root, sectionStart: string): RootContent[] => {
  const out = collectSection(root as unknown as Parent, sectionStart);
  return out ?? [];
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