import type {
    Control,
    GeoJSONOptions,
    ImageOverlayOptions,
    LatLngBounds,
    MapOptions,
    TileLayerOptions,
    VideoOverlayOptions,
    WMSOptions,
} from 'leaflet';

/**
 * Leaflet Map web component configuration.
 */
export interface Configuration {
    /** Map options. */
    options?: MapOptions;
    /** Scale control options. */
    scaleOptions?: Control.ScaleOptions;
    /** Base layers. */
    baseLayers?: LayersControlEntry[];
    /** Overlay layers. */
    overlayLayers?: LayersControlEntry[];
}

/**
 * Layers control entry.
 */
export interface LayersControlEntry {
    /** Layer name. */
    name: string;
    /** Is the layer selected for display at the beginning (only used by overlay layers). */
    selected?: boolean;
    /** Layer configuration. */
    config: LayerConfiguration;
}

/**
 * Layer configuration.
 */
export type LayerConfiguration =
    GeoJSONConfiguration
    | ImageOverlayConfiguration
    | TileLayerConfiguration
    | TileLayerWMSConfiguration
    | VideoOverlayConfiguration
    ;

/**
 * Tile layer configuration.
 */
export interface TileLayerConfiguration {
    /** Kind. */
    kind: 'TileLayer';
    /** URL template. */
    urlTemplate: string;
    /** Options. */
    options?: TileLayerOptions;
}

/**
 * WMS tile layer configuration.
 */
export interface TileLayerWMSConfiguration {
    /** Kind. */
    kind: 'TileLayer.WMS';
    /** Base URL. */
    baseUrl: string,
    /** Options. */
    options: WMSOptions;
}

/**
 * GeoJSON configuration.
 */
export interface GeoJSONConfiguration {
    /** Kind. */
    kind: 'GeoJSON';
    /** ID of script element containing GeoJSON data. */
    id: string,
    /** Fit bounds on display/select. */
    fitBounds?: boolean,
    /** Options. */
    options?: GeoJSONOptions;
    href?: string;
}

/**
 * ImageOverlay configuration.
 */
export interface ImageOverlayConfiguration {
    /** Kind. */
    kind: 'ImageOverlay';
    /** Image URL. */
    imageUrl: string;
    /** Bounds. */
    bounds: LatLngBounds,
    /** Fit bounds on display/select. */
    fitBounds?: boolean,
    /** Options. */
    options?: ImageOverlayOptions;
}

/**
 * VideoOverlay configuration.
 */
export interface VideoOverlayConfiguration {
    /** Kind. */
    kind: 'VideoOverlay';
    /** Image URL(s). */
    videoUrl: string | string[];
    /** Bounds. */
    bounds: LatLngBounds,
    /** Fit bounds on display/select. */
    fitBounds?: boolean,
    /** Options. */
    options?: VideoOverlayOptions;
}