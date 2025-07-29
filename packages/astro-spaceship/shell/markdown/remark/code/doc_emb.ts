import type { Text } from "hast";
import fm from "front-matter";
import z from "zod";
import { fromHtml } from 'hast-util-from-html'


const docEmbSchema = z.object({
  id: z.string(),
  title: z.string(),
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

  const embed = fromHtml(body, { fragment: true })

  return {
    before: [
      {
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
              href: options.href,
            },
            children: [
              {
                type: 'element',
                tagName: 'h5',
                properties: {
                  class: 'file-embed-title'
                },
                children: [
                  {
                    type: 'text',
                    value: attributes.title
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
            children: embed.children
          }
        ]
      }
    ]
  }

  // console.log(options);
}