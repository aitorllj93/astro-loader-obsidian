
import qs from "qs";
import { isError } from "./types";

interface Props {
  strapiUrl: string;
  strapiApiToken: string;
  endpoint: string;
  query?: Record<string, unknown>;
  wrappedByKey?: string;
  wrappedByList?: boolean;
}

/**
 * Fetches data from the Strapi API
 * @param endpoint - The endpoint to fetch from
 * @param query - The query parameters to add to the url
 * @param wrappedByKey - The key to unwrap the response from
 * @param wrappedByList - If the response is a list, unwrap it
 * @returns
 */
export default async function fetchApi<T>({
  strapiUrl,
  strapiApiToken,
  endpoint,
  query,
  wrappedByKey,
  wrappedByList,
}: Props): Promise<T> {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }

  const queryString = query ? qs.stringify(query) : undefined

  const url = new URL(`${strapiUrl}/api/${endpoint}${queryString ? `?${queryString}` : ''}`);

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${strapiApiToken}`
    }
  });
  let data = await res.json();

  if (isError(data)) {
    throw new Error(data.error.message)
  }

  if (wrappedByKey) {
    data = data[wrappedByKey];
  }

  if (wrappedByList) {
    data = data[0];
  }

  return data as T;
}
