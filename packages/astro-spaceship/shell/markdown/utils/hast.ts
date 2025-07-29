import type { Element, Node, Text } from "hast";

export const isElement = (node: Node): node is Element => node.type === "element";
export const isText = (node: Node): node is Text => node.type === "text";

export const isTag = (tagName: string, element: Element) => element.tagName === tagName;