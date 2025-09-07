import he from "he";

import type { Wikilink } from "./wikiLink";
import type { AstroIntegrationLogger } from "astro";

const imageDisplayClassNames: Record<string, string> = {
  'float-left': 'figure-image-float-left',
  'float-right': 'figure-image-float-right',
  'left': 'figure-image-float-left',
  'right': 'figure-image-float-right',
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

const captionChildren = (caption: string): string => {
  const matches = Array.from(caption.matchAll(URL_REGEX));

  if (matches.length === 0) {
    return caption;
  }

  let captionTpl = caption;
  for (const match of matches) {
    const [url] = match;
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    captionTpl = captionTpl.replace(url, `<a href="${urlObj.toString()}">${urlObj.hostname}</a>`);
  }

  return captionTpl;
}

export const renderImage = async (
  rendered: {
    metadata: {
      imagePaths: string[],
    }
  }, 
  link: Wikilink, 
  logger: AstroIntegrationLogger
) => {
  const title = (link.link.href as string).split('/').reverse()?.[0];
  let caption: string|undefined = undefined;
  const altFragments = ((link.link.caption as string) ?? '').split('|');

  const figureProps: Record<string, unknown> = {
    alt: title,
    class: 'figure-image',
  };

  const imageProps: Record<string, unknown> = {
    src: link.link.href,
    alt: link.link.title,
    index: rendered.metadata.imagePaths.indexOf(link.link.href as string)
  };

  for (const fragment of altFragments) {
    const sizing = imageSizing(fragment);

    if (sizing) {
      imageProps.width = sizing.width ?? undefined;
      imageProps.height = sizing.height ?? undefined;
      figureProps.style = imageProps.style = `${sizing.width ? `width: ${sizing.width}px; ` : ''}${sizing.height ? `height: ${sizing.height}px; ` : ''}`
      continue;
    }

    const layoutClassName = imageDisplayClassNames[fragment];

    if (layoutClassName) {
      figureProps.class = [figureProps.class, layoutClassName].join(' ');
      continue;
    }

    caption = fragment;
  }

  const imageElement = `<img __ASTRO_IMAGE_="${he.encode(JSON.stringify(imageProps))}" />`;

  const captionElement = caption && caption !== title ? `<figcaption>${captionChildren(caption)}</figcaption>` : ''

  return `<figure alt="${figureProps.alt}" class="${figureProps.class}" style="${figureProps.style ?? ''}">${imageElement}${captionElement}</figure>`;
}