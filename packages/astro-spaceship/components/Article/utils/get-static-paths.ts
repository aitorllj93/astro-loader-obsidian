import type { GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { toUrl } from "astro-loader-obsidian";
import { join } from "node:path";

import {
	AUTHORS_COLLECTION_NAME,
	DOCUMENTS_COLLECTION_NAME,
	TAGS_COLLECTION_NAME,
} from "../../../constants";

import type {
	Author,
  Document,
  Page,
  SpaceshipConfig,
  Tag,
  TreeData,
} from "../../../types";

import { buildTree } from "../../Tree/utils/buildTree";

export type Props = {
	author?: Author | undefined;
	document: Document;
	page: Page;
	tags: Tag[];
  tree: TreeData;
  backlinks: Document[];
	config: SpaceshipConfig;
};

export type GetStaticPathsFactoryConfig = {
  config: SpaceshipConfig,
  locale?: string,
  authorsCollection?: string;
  documentsCollection?: string;
  tagsCollection?: string; 
}

const shortenText = (text: string, length: number) => {
  if (text.length > length) {
    return `${text.substring(0, length - 3)}...`;
  }
  return text;
}

const buildAuthor = (doc: Document, author?: Author): Author|undefined => {
  if (author) {
    return author
  }

  if (!doc.data.author) {
    return undefined;
  }

  return {
    id: doc.data.author,
    collection: 'authors',
    data: {
      name: doc.data.author,
    }
  }
}

const buildPage = (config: SpaceshipConfig, doc: Document, language?: string): Page => {
  const docDescription = doc.data.description ?? doc.data.subtitle;

  const title = doc.data.title;
  const description = docDescription && shortenText(docDescription, 160);
  const keywords = doc.data.tags?.join(', ');
  const image = doc.data.cover?.src;
  const siteName = config.title;


  return {
    title,
    language: language ?? config.defaultLocale,
    seo: {
      title: `${doc.data.title} | ${config.title}`,
      description,
      keywords,
      image,
      openGraph: {
        description,
        image,
        title,
        siteName,
      },
      twitter: {
        description,
        image,
        title,
      },
    }
  }
}

const buildTags = (
  config: SpaceshipConfig,
  doc: Document,
  tags: Tag[] = []
): Tag[] => {
  const docTags = doc.data.tags?.filter((dt) => !tags.some((t) => t.id === dt)) ?? [];

  return tags.map(t => ({
    ...t,
    data: {
      ...t.data,
      permalink: toUrl(t.id, join(config.base ?? '', '/tags'), false, config.defaultLocale)
    }
  })).concat(
    (docTags.filter(Boolean) as string[]).map((t) => ({
      id: t,
      collection: "tags",
      data: {
        name: t,
        permalink: toUrl(t, join(config.base ?? '', '/tags'), false, config.defaultLocale)
      },
    }))
  );
};


export const getStaticPathsFactory = ({
  config,
  locale,
  authorsCollection = AUTHORS_COLLECTION_NAME,
  documentsCollection = DOCUMENTS_COLLECTION_NAME,
  tagsCollection = TAGS_COLLECTION_NAME,
}: GetStaticPathsFactoryConfig) => (async () => {
	const authors = (await getCollection(authorsCollection)) as Author[];
	const documents = (await getCollection(documentsCollection)) as Document[];
	const tags = (await getCollection(tagsCollection)) as Tag[];

	const tree = buildTree(documents as Document[]);

	return documents
		.filter((d) => d.data.publish !== false)
		.map((document) => ({
			params: { slug: document.id },
			props: {
				config,
				author: buildAuthor(
					document,
					authors.find((a) => a.id === document.data.author),
				),
				document,
        tree,
        backlinks: documents.filter((d) =>
          d.data.links?.some((l) => l.href === document.data.permalink),
        ),
				page: buildPage(config, document, locale),
				tags: buildTags(
          config,
					document,
					tags.filter((t) => document.data.tags?.some((dt) => dt === t.id)),
				),
			} satisfies Props,
		}));
}) satisfies GetStaticPaths;