import type { Element, Text, Parent } from 'hast';

import type { RewriteFn } from './types';
import { isElement } from '../../utils/hast';

import { transformers } from '../../remark/code';

const customCodeBlocks = Object.keys(transformers);

const getLanguageFromCodeTag = (node: Element) => {
  const codeTag = node.children?.[0];

  if (!codeTag || !isElement(codeTag)) {
    return null;
  }

  const className = Array.isArray(codeTag.properties?.className) ?
    codeTag.properties?.className?.find(c => String(c).startsWith('language-'))
    : undefined;

  if (!className) {
    return null;
  }

  return String(className).replace('language-', '')
}

const shouldRender = (node: Element) => {
  if (node.properties && node.properties.dataLanguage === "plaintext") {
    return false;
  }

  const language = getLanguageFromCodeTag(node);

  if (language && customCodeBlocks.includes(language)) {
    return false;
  }

  return true;
}

export default ((
  node: Element,
  _: number,
  __: Parent,
) => {
  if (!shouldRender(node)) {
    node.children = [];
    const newNode = node as unknown as Text;
    newNode.type = "text";
    newNode.value = "";
  }
}) satisfies RewriteFn<Element>;