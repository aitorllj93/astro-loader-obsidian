import type { AstroIntegrationLogger } from "astro";
import { dirname, relative } from "node:path";

import { ALLOWED_AUDIO_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS, ALLOWED_FILE_EXTENSIONS, ALLOWED_IMAGE_EXTENSIONS } from "./constants";
import type { ObsidianContext } from "../types";
import type { ObsidianLink } from "../schemas";
import { getAssetFromLink, getDocumentFromLink, toUrl } from "./obsidianId";
import { slugify } from "./utils/slugify";
import { getAssetPublicUrl } from "./assets";

export type Wikilink = {
  /** @deprecated use Link.type instead */
  isImage: boolean;
  text: string;
  file?: string|undefined;
  link: ObsidianLink;
};

const imageDisplayClassNames: Record<string, string> = {
  'float-left': 'float-left',
  'float-right': 'float-right',
  'left': 'float-left',
  'right': 'float-right',
};

const imageSizing = (text: string): {
  width: number;
  height?: number;
} | null => {
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

const getLinkType = (text: string): ObsidianLink['type'] => {
  if (ALLOWED_IMAGE_EXTENSIONS.some(i => text.includes(i))) {
    return 'image';
  }

  if (ALLOWED_AUDIO_EXTENSIONS.some(i => text.includes(i))) {
    return 'audio';
  }

  if (ALLOWED_VIDEO_EXTENSIONS.some(i => text.includes(i))) {
    return 'video';
  }

  if (ALLOWED_FILE_EXTENSIONS.some(i => text.includes(i))) {
    return 'file';
  }

  return 'document';
};

export const parseWikilinks = (
  content: string,
  source: string,
  context: ObsidianContext,
  logger: AstroIntegrationLogger
): Wikilink[] => {
  const links: Wikilink[] = [];
  const regex = /(!)?\[\[([^\]]+?)\]\]/g; // /\[\[(!)?([\w/]+)\]\]/g;
  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [text, isEmbedded, linkText] = match;

    if (!linkText) {
      links.push({
        text,
        link: {
          isEmbedded: !!isEmbedded,
          type: getLinkType(text),
          title: text,
          href: null,
        },
        isImage: false,
      });
      continue;
    }

    const [hrefFragment, ...fragments] = linkText.split('|');
    const idHref = hrefFragment ?? linkText;
    let title = idHref.split("/").slice(-1)[0] as string;
    const type = getLinkType(idHref);
    let className = '';
    const caption = fragments.length > 0 ? fragments.join('|') : title;

    for (const fragment of fragments) {
      if (type === 'image') {
        const size = imageSizing(fragment);

        if (size) {
          if (size.width) {
            className += ` w-[${size.width}px]`;
          }
          if (size.height) {
            className += ` h-[${size.height}px]`;
          }
          continue;
        }

        const layoutClassName = imageDisplayClassNames[fragment];

        if (layoutClassName) {
          className += ` ${layoutClassName}`;
          continue;
        }
      }

      title = fragment;
    }

    let href: string | null = null;
    let id: string | undefined;
    let file: string | undefined;

    if (type === 'document') {
      const [idWithoutAnchor, anchorTag] = idHref.split('#');
      file = getDocumentFromLink(idWithoutAnchor ?? idHref, context.files);

      if (file) {
        href = toUrl(
          file,
          context.baseUrl,
          context.i18n,
          context.defaultLocale
        );
        if (anchorTag) {
          href = `${href}#${slugify(anchorTag)}`
        }
      } else {
        const fallbackStrategy = context.options.brokenLinksStrategy;
        const errorMessage = `Could not find document from Obsidian link "${idHref}" at "${context.entry}"`;

        if (fallbackStrategy === "warn") {
          logger.warn(errorMessage);
          href = idHref;
        } else if (fallbackStrategy === "404") {
          href = `/404?entry=${slugify(idHref)}&collection=${context.baseUrl}`;
        } else {
          logger.debug(errorMessage);
          href = null;
        }
      }

      id = slugify(file ?? idHref);
    }

    if (
      ['image', 'audio', 'video', 'file'].includes(type)
    ) {
      file = getAssetFromLink(idHref, context.assets);

      if (file) {
        const relativePath = relative(dirname(`/${context.entry}`), `/${file}`);
        href = type === 'image' ? 
          relativePath.startsWith('.') ? relativePath : `./${relativePath}` :
          getAssetPublicUrl(file, context.publicUrl);
        id = slugify(file);
      } else {
        logger.warn(`Could not find ${type} from Obsidian ${type} "${idHref}"`);
      }
    }

    const link: ObsidianLink = {
      caption,
      className: className.trim().length > 0 ? className.trim() : undefined,
      id,
      isEmbedded: !!isEmbedded,
      type,
      source,
      title,
      href
    }


    links.push({
      text,
      file,
      link,
      isImage: link.type === 'image',
    });
  }

  return links;
};
