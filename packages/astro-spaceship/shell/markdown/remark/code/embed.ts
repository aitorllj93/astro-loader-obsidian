import type { Text } from "hast";
import fm from "front-matter";
import z from "zod";
import { frontMatter } from "./utils";

const embedSchema = z.object({
  title: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  favicon: z.string().optional(),
  aspectRatio: z.string()
    .transform((val) => Number.parseInt(val)).pipe(z.number()).optional(),
});

type EmbedInput = z.input<typeof embedSchema>;

export const embed = (node: Text) => {
  const { attributes } = fm<EmbedInput>(`---\n${node.value}\n---\n`);

  if (!attributes) {
    return null;
  }

  const options = frontMatter(node, embedSchema);

  const container = {
    type: "element",
    tagName: "a",
    properties: {
      href: options.url,
      className: ["not-prose embed"]
    },
    children: [
      {
        type: "element",
        tagName: "figure",
        properties: {
          className: ["embed-figure"],
        },
        children: [
          options.image ? {
            type: "element",
            tagName: "picture",
            properties: {
              className: ["embed-picture"]
            },
            children: [
              {
                type: "element",
                tagName: "img",
                properties: {
                  src: options.image,
                  style: `aspect-ratio: 100 / ${options.aspectRatio ?? 50};`
                }
              }
            ],
          } : undefined,
          {
            type: "element",
            tagName: "figcaption",
            properties: {
              className: ["embed-caption"],
            },
            children: [
              options.title ? {
                type: "element",
                tagName: "h5",
                properties: {
                  className: ["embed-title"],
                },
                children: [
                  {
                    type: "text",
                    value: options.title,
                  }
                ]
              } : undefined,
              options.description ? {
                type: "element",
                tagName: "p",
                properties: {
                  className: ["embed-description"],
                },
                children: [
                  {
                    type: "text",
                    value: options.description,
                  }
                ]
              } : undefined,
              {
                type: "element",
                tagName: "p",
                properties: {
                  className: ["embed-url"],
                },
                children: [
                  {
                    type: "text",
                    value: options.url,
                  }
                ]
              }
            ].filter(Boolean),
          }
        ].filter(Boolean),
      }
    ]
  };

  return {
    before: [
      container
    ],
  };
};
