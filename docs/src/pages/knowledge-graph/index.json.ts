import type { APIRoute } from "astro";

import { getGraphView } from "astro-spaceship/components/GraphView/utils/get-graph-view.ts";

export const GET: APIRoute = async () => {
  const data = await getGraphView();

  return new Response(
    JSON.stringify(data),
  );
}