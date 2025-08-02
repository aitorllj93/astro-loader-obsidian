
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import type { Element, ElementContent, Node, Root, RootContent } from "hast";

import type { StoreDocument } from "../types";
import type { ObsidianDocument } from "../schemas";
import { getDocumentFromLink } from './obsidianId';

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

export const parseEmbeds = (body: string, documents: StoreDocument<ObsidianDocument>[]) => {
  const regex = /!\[\[([^\]]+)\]\]/g;

  const matches = body.matchAll(regex);


  let result = body;

  for (const match of matches) {
    const fullMatch = match[0];
    const [id, section] = (match[1] ?? '').split('#');
    if (!id) {
      continue;
    }
    const documentId = getDocumentFromLink(id, documents.map(f => f.id));


    if (!documentId) {
      continue;
    }

    const document = documents.find(d => d.id === documentId);

    if (!document) {
      continue;
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

    result = result.replace(fullMatch, embed);
  }

  return result;
}