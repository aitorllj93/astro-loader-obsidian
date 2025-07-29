
import type { Text } from 'hast';
import { fromMarkdown, mdast2Tree } from './utils';
import { isElement } from '../../utils/hast';

export const spoiler = (node: Text) => {
  const newNode = mdast2Tree(fromMarkdown(node.value, undefined));

  const children = isElement(newNode) ? newNode.children : [];

  return {
    before: [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          className: 'spoiler'
        },
        children: [
          {
            type: 'element',
            tagName: 'input',
            properties: {
              type: 'checkbox',
              id: 'spoilerToggle',
              className: 'absolute sr-only peer'
            }
          },
          {
            type: 'element',
            tagName: 'label',
            properties: {
              for: 'spoilerToggle',
              className: "spoiler-toggle"
            },
            children: [
              {
                type: 'element',
                tagName: 'p',
                children: [
                  {
                    type: 'text',
                    value: 'Display Spoiler'
                  }
                ]
              }
            ]
          },
          {
            type: 'element',
            tagName: 'label',
            properties: {
              for: 'spoilerToggle',
              className: "spoiler-content"
            },
            children,
          },
        ]
      }
    ]
  }
}