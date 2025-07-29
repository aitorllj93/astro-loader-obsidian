import type { Element, Node, Text, Root, RootContent } from "hast";

export const isElement = (node: Node): node is Element => node.type === "element";
export const isText = (node: Node): node is Text => node.type === "text";

export const isTag = (tagName: string, element: Element) => element.tagName === tagName;

export const getTextFromElement = (el: Element): string => {
  return el.children
    .filter(child => child.type === 'text')
    .map(child => child.value)
    .join('')
    .trim();
};

export const getSectionFromRoot = (root: Root, sectionStart: string): RootContent[] => {
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