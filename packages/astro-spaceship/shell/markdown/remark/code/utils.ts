
import type { Element, Node, Properties, Text } from 'hast';
import fm from "front-matter";
import { fromMarkdown } from "mdast-util-from-markdown";
import { isText } from '../../utils/hast';
import type { z, ZodSchema } from 'zod';

export { fromMarkdown };

export const mdast2Tree = (mdast: Node, properties: Properties = {}) => {
  if (isText(mdast)) {
    return mdast;
  }

  const result = mdast as Element;

  result.tagName = mdast.type;
  result.type = "element";
  result.properties = properties;

  if (result.tagName === "root") {
    result.tagName = "div";
  }

  if (result.tagName === "link") {
    result.tagName = "a";
    result.properties = {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      href: (result as any).url,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      title: (result as any).title,
    };
  }

  if (result.tagName === "list") {
    result.tagName = "ul";
  }

  if (result.tagName === "listItem") {
    result.tagName = "li";
  }

  if (result.tagName === "heading") {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    result.tagName = `h${(result as any).depth}`;
  }

  if (result.tagName === "paragraph") {
    result.tagName = "p";
  }

  if (result.children) {
    result.children.map((c) => mdast2Tree(c));
  }

  return result;
};

export const frontMatter = <T extends ZodSchema>(node: Text, schema: T): z.infer<T> => {
  const { attributes } = fm<z.input<typeof schema>>(`---\n${node.value}\n---\n`);

  if (!attributes) {
    return null;
  }

  const options = schema.parse(attributes);

  return options;
}