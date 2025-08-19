import type { Feature } from "geojson";
import type { Document } from "../../../types";


export const documentToFeature = (d: Document): Feature|null => d.data.location ? ({
    type: 'Feature',
    properties: {
      additionalType: d.data.additionalType,
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