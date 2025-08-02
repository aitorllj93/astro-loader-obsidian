import type { AstroGlobal, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import type { Document, Page, SpaceshipConfig, TreeData } from "../../../types";
import { useI18n } from "../../../i18n";
import { buildTree } from "../../Tree/utils/buildTree";
import { DOCUMENTS_COLLECTION_NAME } from "../../../constants";

export const buildPage = (astro: AstroGlobal, locale: string): Page => {
  const { t } = useI18n(astro);

  return ({
    language: locale,
    title: t("404.title"),
    seo: {
      description: t("404.description"),
    },
  })
}

export type Props = {
  config: SpaceshipConfig;
  tree: TreeData;
};

export type GetStaticPathsFactoryConfig = {
  config: SpaceshipConfig,
  locale?: string,
  documentsCollection?: string;
}

export const getStaticPathsFactory = (
  {
    documentsCollection = DOCUMENTS_COLLECTION_NAME,
    config,
  }: GetStaticPathsFactoryConfig
) => (async () => {
  const documents = (await getCollection(documentsCollection)) as Document[];
  const tree = buildTree(documents);

  return [{
    params: {},
    props: {
      config,
      tree,
    } as Props
  }];
}) satisfies GetStaticPaths;