
import { getCollection } from "astro:content";
import type { Feature, FeatureCollection } from "geojson";

import { DOCUMENTS_COLLECTION_NAME } from "../../../constants";
import type { Document } from "../../../types";
import { documentToFeature } from "./document-to-feature";

export const getIndex = async (collectionName = DOCUMENTS_COLLECTION_NAME): Promise<FeatureCollection> => {
  const allDocuments = await getCollection(collectionName, (d: Document) => !!d.data.location);

  const features = allDocuments.map(documentToFeature).filter(Boolean) as Feature[];

  return {
    type: 'FeatureCollection',
    features,
  };
}