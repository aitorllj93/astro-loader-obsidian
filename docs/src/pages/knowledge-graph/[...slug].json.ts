import type { APIRoute } from "astro";

import { getStaticPathsFactory } from "astro-spaceship/components/Article/utils/get-static-paths.ts";
import { getGraphView } from "astro-spaceship/components/GraphView/utils/get-graph-view.ts";

import config from '@/config';

export const GET: APIRoute = async ({ params }) => {
  const data = await getGraphView(params.slug);

  return new Response(
    JSON.stringify(data),
  );
}

export const getStaticPaths = getStaticPathsFactory({
  config,
});