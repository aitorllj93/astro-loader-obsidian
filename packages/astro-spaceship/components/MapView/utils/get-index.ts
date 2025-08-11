
import { getCollection } from "astro:content";
import type { Feature, FeatureCollection } from "geojson";

import { DOCUMENTS_COLLECTION_NAME } from "../../../constants";
import type { Document } from "../../../types";

const documentToFeature = (d: Document): Feature|null => d.data.location ? ({
    type: 'Feature',
    properties: {
      name: d.data.title,
      href: d.data.permalink,
    },
    geometry: {
      type: 'Point',
      coordinates: [
        d.data.location.lng,
        d.data.location.lat,
      ]
    }
  }) : null;

export const getIndex = async (collectionName = DOCUMENTS_COLLECTION_NAME): Promise<FeatureCollection> => {
  const allDocuments = await getCollection(collectionName, (d: Document) => !!d.data.location);

  const features = allDocuments.map(documentToFeature).filter(Boolean) as Feature[];

  return {
    type: 'FeatureCollection',
    features,
  };
}