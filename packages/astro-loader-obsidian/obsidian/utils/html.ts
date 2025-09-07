
import { type HTMLElement, type TextNode, type Node, NodeType } from 'node-html-parser';
export { parse } from 'node-html-parser';

const replaceNode = (node: Node, text: string, replacement: string) => {
  const replaced = node.rawText.replaceAll(text, replacement);
  if (replaced !== node.rawText) {
    node.rawText = replaced;
  }
}

export const replaceOutsideDataCode = async (
  root: HTMLElement,
  wikilinkText: string,
  replacementHTML: string,
  shouldWrapWithNextNode = false,
) => {
  const textNodes: TextNode[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === NodeType.TEXT_NODE) {
      // TextNode
      if (!isInsideDataCode(node)) {
        textNodes.push(node as TextNode);
      }
    } else {
      const element = node as HTMLElement;
      // Recorre hijos (no inspeccionamos atributos, porque queremos evitarlos)
      element.childNodes.forEach(walk);
    }
  };

  const isInsideDataCode = (node: Node): boolean => {
    let current: HTMLElement | null = node.parentNode as HTMLElement;
    while (current) {
      const isCode = current.classList.contains('expressive-code');
      if (isCode) {
        return true;
      }

      const dataCode = current.getAttribute?.('data-code');
      if (dataCode?.includes(wikilinkText)) {
        return true;
      }
      current = current.parentNode as HTMLElement;
    }
    return false;
  };

  const isWhitespaceTextNode = (n: Node) =>
    n.nodeType === NodeType.TEXT_NODE && (n.textContent ?? '').trim() === '';

  const isParagraphElement = (n: Node) =>
    n.nodeType === 1 && (n as HTMLElement).tagName === 'P';

  const wrapWithNextNode = (textNode: Node) => {
    const elementNode = textNode.parentNode;
    const parent = elementNode.parentNode as HTMLElement;
    if (!parent) {
      // Fallback: si no hay parent, sustituimos normal
      replaceNode(textNode, wikilinkText, replacementHTML);
      return;
    }

    const siblings = parent.childNodes;
    const idx = siblings.indexOf(elementNode);

    // Find the first non-whitespace sibling after the text node
    let i = idx + 1;
    while (i < siblings.length && isWhitespaceTextNode(siblings[i] as Node)) i++;

    // If the first non-whitespace isn't a paragraph, just replace normally
    if (i >= siblings.length || !isParagraphElement(siblings[i] as Node)) {
      replaceNode(textNode, wikilinkText, replacementHTML);
      return;
    }

    // Collect ALL consecutive <p> siblings (allowing whitespace text nodes in between)
    const collectedIndices: number[] = [];
    let j = i;
    while (j < siblings.length) {
      const node = siblings[j];
      if (isWhitespaceTextNode(node as Node)) {
        j++;
        continue;
      }
      if (isParagraphElement(node as Node)) {
        collectedIndices.push(j);
        j++;
        continue;
      }
      // Stop on first different kind
      break;
    }

    // Build recomposed HTML:
    //  - keep everything before the text node
    //  - insert <div>{replacementHTML}{...all collected <p>...</div>
    //  - keep everything after the last collected index
    const beforeHTML = siblings.slice(0, idx).map(n => n.toString()).join('');
    const collectedHTML = collectedIndices.map(k => (siblings[k] as Node).toString()).join('');
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const afterHTML = siblings.slice(collectedIndices.at(-1)! + 1).map(n => n.toString()).join('');

    const wrapped = `<div class="text-with-image">${replacementHTML}${collectedHTML}</div>`;
    parent.innerHTML = beforeHTML + wrapped + afterHTML;
  }

  walk(root);

  for (const textNode of textNodes) {
    // Prevent other references to override embeds
    if (!textNode.innerText.includes(wikilinkText) || textNode.rawText === `!${wikilinkText}`) {
      continue;
    }

    if (!shouldWrapWithNextNode) {
      replaceNode(textNode, wikilinkText, replacementHTML);
      continue;
    }

    wrapWithNextNode(textNode);
  }
};