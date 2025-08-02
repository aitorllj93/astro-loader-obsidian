
import { getCollection } from "astro:content";

import { buildTree } from "../../Tree/utils/buildTree.ts";

import type { Author, Document, Page, SpaceshipConfig, Tag, TreeData } from "../../../types";
import { DOCUMENTS_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../../constants.ts";

export type Props = {
	author?: Author;
	documents: Document[];
	page: Page;
	tag: Tag;
  tree: TreeData;
	config: SpaceshipConfig;
};

const shortenText = (text: string, length: number) => {
  if (text.length > length) {
    return `${text.substring(0, length - 3)}...`;
  }
  return text;
}

const buildPage = (config: SpaceshipConfig, tag: Tag, language?: string): Page => {

  const docDescription = tag.data.description;

  const title = tag.data.name;
  const description = docDescription && shortenText(docDescription, 160);
  const keywords = tag.data.name;
  const siteName = config.title;


  return {
    title,
    language: language ?? config.defaultLocale,
    seo: {
      title,
      description,
      keywords,
      openGraph: {
        description,
        title,
        siteName,
      },
      twitter: {
        description,
        title,
      },
    }
  }
}


type GetStaticPathsFactoryConfig = {
  config: SpaceshipConfig,
  locale?: string,
  documentsCollection?: string;
  tagsCollection?: string; 
}

export const getStaticPathsFactory = ({
  config,
  locale,
  documentsCollection = DOCUMENTS_COLLECTION_NAME,
  tagsCollection = TAGS_COLLECTION_NAME,
}: GetStaticPathsFactoryConfig) => async () => {
	const documents = await getCollection(documentsCollection) as Document[];
	const tags = await getCollection(tagsCollection) as Tag[];

	const tree = buildTree(documents);

	const allTags: {
		id: string;
		name: string;
	}[] = documents.flatMap(d => ([
		...(d.data.links?.filter(l => l.type === 'tag' && l.id).map(l => ({
			id: l.id as string,
			name: l.title,
		})) ?? []),
		...(d.data.tags?.map(t => ({
			id: t,
			name: t,
		})) ?? []),
	]));

	return [...new Set(allTags)].map(entry => {
		const tag = tags.find(t => t.id === entry.id) ?? {
			collection: 'tags',
			id: entry.id,
			data: {
				name: entry.name
			}
		};

		const taggedDocuments = documents.filter(d => d.data.tags?.includes(tag.id) || d.data.links?.some(l => l.type === 'tag' && l.id === tag.id))

		return ({
			params: {
				tag: tag.id,
			},
			props: {
				tag,
				documents: taggedDocuments,
        tree,
				page: buildPage(config, tag, locale),
				config,
			} satisfies Props,
		})
	});

}

