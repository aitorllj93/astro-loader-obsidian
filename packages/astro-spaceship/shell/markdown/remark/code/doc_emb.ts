import type { Text } from "hast";
import fm from "front-matter";
import z from "zod";
import { fromHtml } from 'hast-util-from-html'
import { getSectionFromRoot } from "../../utils/hast";


const docEmbSchema = z.object({
  id: z.string(),
  title: z.string(),
  caption: z.string().nullish(),
  href: z.string(),
});

type DocEmbInput = z.input<typeof docEmbSchema>;

/**
 * Internal renderer for File Embeds
 */
export const docEmb = async (node: Text) => {
  const { attributes, body } = fm<DocEmbInput>(node.value);

  if (!attributes) {
    return null;
  }

  const options = docEmbSchema.parse(attributes);

  const root = fromHtml(body, { fragment: true });

  const anchor = options.caption?.split('#')[1];

  const children = anchor ? getSectionFromRoot(root, anchor) : root.children;

  return {
    before: [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'file-embed'
        },
        children: [
          !anchor && {
            type: 'element',
            tagName: 'h5',
            properties: {
              class: 'file-embed-title'
            },
            children: [
              {
                type: 'text',
                value: attributes.title,
              },
            ]
          },
          {
            type: 'element',
            tagName: 'a',
            properties: {
              class: 'file-embed-link',
              href: options.href,
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
        ].filter(Boolean)
      }
    ]
  };
}