
import type { Text } from 'hast';
import { fromMarkdown, mdast2Tree } from './utils';

type Block = {
  date: string;
  title: string;
  content: string;
}

export const timeline = (node: Text) => {
  // extract first line from node.value and separate the rest based on newlines

  const lines = node.value.split("\n");
  const firstLine = lines.shift();
  let curIndex = 0;
  const items = lines.reduce((acc, line) => {
    let curBlock = acc[curIndex];

    if (!curBlock) {
      acc[curIndex] = curBlock = {
        title: "",
        date: "",
        content: "",
      };
    }

    if (line.trim() === "") {
      curIndex++;
    } else if (line.startsWith("date:")) {
      curBlock.date = line.replace("date:", "").trim();
    } else if (line.startsWith("title:")) {
      curBlock.title = line.replace("title:", "").trim();
    } else if (line.startsWith("content:")) {
      curBlock.content = line.replace("content:", "").trim();
    } else {
      curBlock.content += `${line}\n`;
    }

    return acc;
  }, [] as Block[]);

  const children = items.map((item, index) => {
    const mdastDate = mdast2Tree(fromMarkdown(item.date, undefined), {
      className: ["timeline-card--date"],
    });
    const mdastTitle = mdast2Tree(fromMarkdown(item.title, undefined), {
      className: ["timeline-card--title"],
    });
    const mdastContent = mdast2Tree(fromMarkdown(item.content, undefined), {
      className: ["timeline-card--content"],
    });
    const isEven = index % 2 === 0;

    const card = {
      type: "element",
      tagName: "div",
      properties: {
        className: "timeline-item__card",
      },
      children: [
        mdastDate,
        {
          type: "element",
          tagName: "div",
          properties: {
            className: ["timeline-card--body"],
          },
          children: [mdastTitle, mdastContent],
        },
      ],
    };

    card.properties.className += isEven ? " timeline-item__card--start" : " timeline-item__card--end";

    return {
      type: "element",
      tagName: "li",
      properties: {
        className: ["timeline-item"],
      },
      children: [
        {
          type: "element",
          tagName: "hr",
          properties: {
            className: "timeline-item__line--start",
          },
        },
        isEven && card,
        {
          type: "element",
          tagName: "div",
          properties: {
            className: "timeline-item__indicator",
          },
        },
        !isEven && card,
        {
          type: "element",
          tagName: "hr",
          properties: {
            className: "timeline-item__line--end",
          },
        },
      ].filter(Boolean),
    };
  });

  return {
    before: [
      {
        type: "element",
        tagName: "ul",
        properties: {
          className: ["not-prose timeline"],
        },
        children,
      },
    ],
  };
};