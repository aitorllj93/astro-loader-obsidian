import type { Element, ElementContent, Node, Text, Parent } from 'hast';

import type { RewriteFn } from './types';

export default ((
  node: Element,
  _: number,
  __: Parent,
) => {
  if (node.properties.dataLanguage === "plaintext") {
    node.children = [];
    const newNode = node as unknown as Text;
    newNode.type = "text";
    newNode.value = "";
  }
}) satisfies RewriteFn<Element>;