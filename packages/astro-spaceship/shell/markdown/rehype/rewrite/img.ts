import type { Element, ElementContent, Parent } from 'hast';
import { isElement } from '../../utils/hast';
import type { RewriteFn } from './types';

const imageDisplayClassNames: Record<string, string> = {
  'float-left': 'float-left my-0 mr-3',
  'float-right': 'float-right my-0 ml-3',
  'left': 'float-left my-0 mr-3',
  'right': 'float-right my-0 ml-3',
};

const imageSizing = (text: string): {
  width: number;
  height?: number;
}|null => {
  if (!Number.isNaN(+text)) {
    return { width: Number.parseInt(text) };
  }

  const [w, h] = text.split('x') as [string, string];

  if (!w || !h) {
    return null;
  }

  if (!Number.isNaN(+w) && !Number.isNaN(+h)) {
    return { width: Number.parseInt(w as string), height: Number.parseInt(h as string) };
  }

  return null;
}

const URL_REGEX = /(?<!@)\b(?:https?:\/\/(?:[\w]*:[\w]*@)?)?[\w\-\.]+\.(?:com|org|co\.uk|net|de|com\.br|io|com\.au|it|fr|nl|co|in|ca|github\.io|co\.jp|ch|se|es|eu|edu|ai|be|me|us|blogspot\.com|jp|dk|ru|app|co\.za|dev|pl|co\.kr|co\.in|com\.mx|no|info|pt|fi|cn|cz|tech|org\.uk|ro|biz|ie|gov|co\.nz|com\.cn|xyz|com\.tr|gr|tv|mx|ae|at)\b(?:\/[\w.,?^=%&:\/~+#\-]*[\w?^=%&\/~+#\-])?/gim;

const captionChildren = (caption: string): ElementContent[] => {
  const matches = Array.from(caption.matchAll(URL_REGEX));

  if (matches.length === 0) {
    return [{
      type: 'text',
      value: caption,
    }];
  }

  let captionTpl = caption;
  const linkElements: Element[] = [];
  for (const match of matches) {
    const [url] = match;
    const urlObj = new URL(url);
    captionTpl = captionTpl.replace(url, '$$$_$$$');
    linkElements.push({
      type: 'element',
      tagName: 'a',
      properties: { href: url },
      children: [
        {
          type: 'text',
          value: urlObj.hostname,
        },
      ],
    })
  }

  return captionTpl.split('$$').map(text => {
    if (text === '') {
      return null;
    }

    if (text === '_') {
      return linkElements.shift();
    }

    return {
      type: 'text',
      value: text
    };
  }).filter(Boolean) as ElementContent[];
}

export default ((node: Element, index: number, parent: Parent) => {
  const image = JSON.parse(JSON.stringify(node));
  const title = (node.properties.src as string).split('/').reverse()?.[0];
  let caption: string|undefined = undefined;

  if (isElement(parent) && parent.tagName === 'figure') {
    // already parsed
    return null;
  }

  for (const fragment of ((node.properties.alt as string) ?? '').split('|')) {
    const sizing = imageSizing(fragment);

    if (sizing) {
      image.properties.width = sizing.width ?? undefined;
      image.properties.height = sizing.height ?? undefined;
      image.properties.style = `${sizing.width ? `width: ${sizing.width}px; ` : ''}${sizing.height ? `height: ${sizing.height}px; ` : ''}`
      continue;
    }

    const layoutClassName = imageDisplayClassNames[fragment];

    if (layoutClassName) {
      node.properties.className = layoutClassName;
      continue;
    }

    caption = fragment;
  }
  

  image.properties.alt = title;
  image.properties.class = 'mx-0';

  node.tagName = 'figure';
  node.properties.alt = title;
  node.children = [
    image,
    caption && caption !== title ? {
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: captionChildren(caption),
    } : undefined,
  ].filter(Boolean);
  node.properties.src = undefined;
}) satisfies RewriteFn<Element>;