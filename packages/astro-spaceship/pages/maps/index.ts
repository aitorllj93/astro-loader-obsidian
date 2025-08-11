import type { APIRoute } from "astro";

import { getIndex } from "../../components/MapView/utils/get-index.ts";

export const GET: APIRoute = async () => {
  const data = await getIndex();

  return new Response(
    JSON.stringify(data),
  );
}