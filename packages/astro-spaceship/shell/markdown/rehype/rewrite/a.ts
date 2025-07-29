import type { Element, Parent } from 'hast';
import type { RewriteFn } from './types';
import { isText } from '../../utils/hast';

export default ((node: Element, index: number, parent: Parent) => {

  const isTag = node.children.some(c => isText(c) && c.value.startsWith('#'));

  if (!isTag) {
    return;
  }

  node.properties.class = 'article-tag';

}) satisfies RewriteFn<Element>;