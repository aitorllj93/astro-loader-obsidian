import type { APIRoute } from "astro";

import { getStaticPathsFactory } from "../components/Article/utils/get-static-paths.ts";
import { getMapView } from "../components/MapView/utils/get-map-view.ts";

import config from '@/config';

export const GET: APIRoute = async ({ params, props }) => {
  const data = await getMapView(params.slug);

  return new Response(
    JSON.stringify(data),
  );
}

export const getStaticPaths = getStaticPathsFactory({
  config,
});