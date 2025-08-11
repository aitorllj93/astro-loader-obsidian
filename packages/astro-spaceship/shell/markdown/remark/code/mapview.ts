import type { Element, Text } from "hast";
import z from "zod";

import { toUrl } from "../../utils/id";
import { getConfig } from "../../utils/config";

const mapViewSchema = z.object({ 
  name: z.string(), 
  mapZoom: z.number(), 
  centerLat: z.number(), 
  centerLng: z.number(), 
  query: z.string(), 
  chosenMapSource: z.number(), 
  autoFit: z.boolean(), 
  lock: z.boolean(), 
  showLinks: z.boolean(), 
  linkColor: z.string(), 
  markerLabels: z.string(), 
  embeddedHeight: z.number() 
})

const STYLES_NODE = {
  type: "element",
  tagName: "link",
  properties: {
    "data-pagefind-weight": "0",
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
    crossorigin: "",
  },
  children: [],
} satisfies Element;

const JS_NODE = {
  type: "element",
  tagName: "script",
  properties: {
    "data-pagefind-weight": "0",
    src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=",
    crossorigin: "",
  },
  children: [],
} satisfies Element;

const getUrlFromQuery = (query: string, base?: string) => {
  if (!query.startsWith('linkedfrom')) {
    console.warn("Only linkedfrom operator is accepted for now. Query:", query);
    return null;
  }

  const [_, searchVal] = query.split(':');

  if (!searchVal) {
    return null;
  }

  return `${toUrl(searchVal, `${base ?? '/'}_spaceship/map`)}.json`;
}

export const mapview = async (node: Text) => {
  const attributes = JSON.parse(node.value);

	if (!attributes) {
		return null;
	}

	const { data, error, success } = mapViewSchema.safeParse(attributes);

  if (!success || !data) {
    console.warn(error);
    return {};
  }

  const config = await getConfig();

  const href = getUrlFromQuery(data.query, config.base);

  // const href = 'http://localhost:4321/trip-planner/_spaceship/map/agosto-2025/2025-08-23.json';

  return {
    before: [
      STYLES_NODE,
      JS_NODE,
			{
				type: "element",
				tagName: "map-view",
				properties: {
  				"data-pagefind-weight": "0",
					className: 'map',
				},
        children: [
          {
            type: 'element',
            tagName: 'script',
						properties: {
							type: "application/json",
						},
            children: [
              {
                type: 'text',
                value: JSON.stringify({
                  options: {
                    attributionControl: false,
                    center: [data.centerLat, data.centerLng],
                    zoom: data.mapZoom,
                    // maxZoom: options.maxZoom,
                    // minZoom: options.minZoom,
                    zoomControl: false,
                  },
                  scaleOptions: {
                    maxWidth: 200,
                  },
                  baseLayers: [
                    {
                      name: "OpenStreetMaps",
                      config: {
                        kind: "TileLayer",
                        urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                        // 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}.{ext}',
                        options: {
                          attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                          subdomains: 'abcd', // mt2,
                          maxZoom: 20
                        },
                      },
                    },
                  ],
                  overlayLayers: [
                    {
                      name: data.name,
                      selected: true,
                      config: {
                        kind: 'GeoJSON',
                        id: data.name,
                        href,
                        options: {
                          useSimpleStyle: true,
                          useMakiMarkers: true,
                        }
                      }
                    }
                  ]
                }, null, 2)
              }
            ]
          },
          {
            type: "element",
						tagName: "script",
						properties: {
							id: data.name,
							type: "application/geo+json",
							src: href
						},
          }
        ]
      },
    ]
  }

};