import type { APIRoute } from "astro";

import { getStaticPathsFactory } from "../../components/Article/utils/get-static-paths.ts";
import { getLinkedFrom } from "../../components/MapView/utils/get-linked-from.ts";

import config from "astro-spaceship/config";

export const GET: APIRoute = async ({ params, props }) => {
  const data = await getLinkedFrom(params.slug);

  return new Response(
    JSON.stringify(data),
  );
}

export const getStaticPaths = getStaticPathsFactory({
  config,
});