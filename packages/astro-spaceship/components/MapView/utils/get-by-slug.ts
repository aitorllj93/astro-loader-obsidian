
import { getEntry } from "astro:content";
import type { Feature, FeatureCollection } from "geojson";

import { DOCUMENTS_COLLECTION_NAME } from "../../../constants";
import type { Document } from "../../../types";
import { documentToFeature } from "./document-to-feature";

export const getBySlug = async (slug?: string, collectionName = DOCUMENTS_COLLECTION_NAME): Promise<FeatureCollection> => {
  const document = (await getEntry({
    collection: collectionName,
    id: slug,
  })) as Document;

  const linkedDocuments = (await Promise.all(
    (document.data.links ?? []).filter((l) => l.type === 'document' && l.id).map(
    (l) => getEntry({
      collection: collectionName,
      id: l.id,
    })
  )) as Document[]).filter(d => d.data.publish !== false && d.data.location).map(documentToFeature)

  return {
    type: 'FeatureCollection',
    features: [
      documentToFeature(document),
      ...linkedDocuments,
    ].filter(Boolean) as Feature[],
  };
}