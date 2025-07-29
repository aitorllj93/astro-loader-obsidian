import fetch from "./strapi";
import { isEntity, type StrapiCollectionResponse, type StrapiEntityResponse } from "./types";

const fetchAllPaginated = async <T extends { id: string }>(
  strapiUrl: string,
  strapiApiToken: string,
  locale: string,
  status: string,
  endpoint: string,
  data: Record<string, unknown>,
  singleEntity = false,
  page = 1
) => {
  let result: T[] = [];

  const query = {
    ...data,
    locale,
    status,
    pagination: {
      page,
      pageSize: 100,
    },
  };

  const response = await fetch<
    | StrapiEntityResponse<T & { documentId: string }>
    | StrapiCollectionResponse<T & { documentId: string }>
  >({
    strapiUrl,
    strapiApiToken,
    endpoint,
    query,
  });

  if (isEntity(response, singleEntity)) {
    result.push({
      ...response.data,
      id: response.data.id.toString(),
    });
  } else {
    result = result.concat(
      response.data.map((i) => ({ ...i, id: i.id.toString() }))
    );

    if (
      response.meta.pagination.pageCount !== 0 &&
      response.meta.pagination.page !== response.meta.pagination.pageCount
    ) {
      const more = await fetchAllPaginated<T>(
        strapiUrl,
        strapiApiToken,
        locale,
        status,
        endpoint,
        query,
        singleEntity,
        page + 1
      );

      result = result.concat(more);
    }
  }

  return result;
};

type StrapiConfig = {
  strapiUrl: string;
  strapiApiToken: string;
  locales: string[];
  status?: "draft" | "published";
}

export function createStrapiLoader({
  strapiUrl,
  strapiApiToken,
  locales,
  status = 'published',
}: StrapiConfig) {
  return (
    endpoint: string,
    query: Record<string, unknown>,
    singleEntity = false
  ) =>
    async <T extends { id: string }>() => {
      let result: T[] = [];

      for (const locale of locales) {
        try {
          const data = await fetchAllPaginated<T>(
            strapiUrl,
            strapiApiToken,
            locale,
            status,
            endpoint,
            query,
            singleEntity
          );

          result = result.concat(data);
        } catch (err) {
          console.error(
            `StrapiLoader: "${(err as Error).message
            }" error loading content from endpoint "${endpoint}" with locale "${locale}"`
          );
        }
      }

      return result;
    };
}
