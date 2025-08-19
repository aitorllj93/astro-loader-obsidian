
import L, { Control, ImageOverlay, GeoJSON, type Layer, Map as LMap, TileLayer, VideoOverlay } from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';
import type { Configuration, GeoJSONConfiguration, LayerConfiguration } from './LeafletMapConfig';

// import 'leaflet-simplestyle';

const LABEL_SHOW_FROM = 17;
const MARKER_BASE_ZOOM = 15; // a partir de aquí escalamos
const LABEL_BASE_ZOOM = 17; // a partir de aquí escalamos
const MARKER_SCALE_STEP = 1.18; // factor por nivel de zoom (ajústalo al gusto)
const LABEL_SCALE_STEP = 1.18; // factor por nivel de zoom (ajústalo al gusto)

class LeafletMap extends HTMLElement {

  // #map
  private mapElement!: HTMLDivElement;
  private scriptElements!: Array<HTMLElement>;

  private map: LMap | undefined;

  connectedCallback() {
    const options = {
      root: document,
      rootMargin: "0px",
      scrollMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.load();
          observer.unobserve(this);
          observer.disconnect();
        }
      }
    }, options);

    observer.observe(this);
  }

  private async load() {
    if (!this.mapElement) {
      this.mapElement = document.createElement("div");
      this.mapElement.setAttribute('id', 'map');
      this.mapElement.setAttribute('class', 'not-prose');
      this.mapElement.setAttribute('style', 'width: 100%; height: 100%;');
      this.appendChild(this.mapElement);
    }

    this.renderLeaflet();
  }

  private async renderLeaflet() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    try {
      const jsonString = await this.loadData('application/json')
      const config = JSON.parse(jsonString) as Configuration;

      const map = new LMap(this.mapElement, config.options);
      this.map = map;

      this.map.on('layeradd', () => {
        setTimeout(() =>  
          window.dispatchEvent(new CustomEvent('MapRendered'))
        , 100)
      });
      this.map.on('zoomend', () => {
        setTimeout(() =>  
          window.dispatchEvent(new CustomEvent('MapRendered'))
        , 100)
      });

      let layerCount = 0;
      const layersControl = new Control.Layers();

      if (config.baseLayers) {
        for (const entry of config.baseLayers) {
          const layer = await this.newLayer(entry.config);
          if (layer !== undefined) {
            layer.addTo(map);
            layersControl.addBaseLayer(layer, entry.name);
            layerCount++;
          }
        }
      }
      if (config.overlayLayers) {
        for (const entry of config.overlayLayers) {
          const layer = await this.newLayer(entry.config);
          if (layer) {
            if (entry.selected) {
              layer.addTo(map);
            }
            // layersControl.addOverlay(layer, entry.name);
            layerCount++;
          }
        }
      }

      if (layerCount > 0) {
        // layersControl.addTo(map);

        // const scaleControl = new Control.Scale(config.scaleOptions);
        // scaleControl.addTo(map);
      }
      this.map?.locate({watch: true });
      this.locationMarker({ lat: 0, lng: 0 })
    } catch (e) {
      console.error('leaflet-map', this.id, 'error loading map', e);
    }
  }

  private async newLayer(config: LayerConfiguration) {
    switch (config.kind) {
      case 'TileLayer':
        return new TileLayer(config.urlTemplate, config.options);
      case 'TileLayer.WMS':
        return new TileLayer.WMS(config.baseUrl, config.options);
      case 'GeoJSON': {
        if (!config.options) {
          config.options = {};
        }

        config.options.pointToLayer = (feature, latlng) => {
          return this.zoomableMarker(feature, latlng, config);

          // return new L.CircleMarker(latlng, {
          //   radius: 1,
          //   className: 'map-marker',
          // }).bindTooltip(label, { permanent: true, opacity: 0 });
        };
        config.options.onEachFeature = (feature, layer) => this.onEachFeature(feature, layer, config);
        const layer = new GeoJSON(null, config.options);
        // if (config.href) {
        //   layer.on('click', () => {
        //     window.location.href = config.href
        //   }, this);
        // }

        // if (config.fitBounds) {
        //   layer.on('add', () => {
        //     if (this.map && config.fitBounds) {
        //       this.map.fitBounds(layer.getBounds());
        //     }
        //   });
        // }
        this.loadData('application/geo+json', config.id)
          .then(json => {
            try {
              const o = JSON.parse(json);
              layer.addData(o as GeoJsonObject);
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              // (layer as any).useSimpleStyle();
            } catch (e) {
              console.error('leaflet-map', this.id, 'error loading GeoJSON', e);
            }
          })
          .catch(reason => {
            console.error('leaflet-map', this.id, 'error loading GeoJSON', reason, config.id);
          });
        return layer;
      }
      case 'ImageOverlay': {
        const layer = new ImageOverlay(config.imageUrl, config.bounds, config.options);
        if (config.fitBounds) {
          layer.on('add', () => {
            if (this.map && config.fitBounds) {
              this.map.fitBounds(layer.getBounds());
            }
          });
        }
        return layer;
      }
      case 'VideoOverlay': {
        const layer = new VideoOverlay(config.videoUrl, config.bounds, config.options);
        if (config.fitBounds) {
          layer.on('add', () => {
            if (this.map && config.fitBounds) {
              this.map.fitBounds(layer.getBounds());
            }
          });
        }
        return layer;
      }
      default:
        console.error('leaflet-map', this.id, 'unknown layer kind', config);
        return undefined;
    }
  }

  private onEachFeature(feature: Feature, layer: Layer, config: GeoJSONConfiguration): void {
    this.zoomableLabel(feature, layer, config);
  }

  private locationMarker(latlng: L.LatLngExpression) {
    const marker = L.marker(latlng);
    const circle = new L.Circle(latlng, 2, {
      radius: 2,
      weight: 1,
      color: 'blue',
      fillColor: '#cacaca',
      fillOpacity: 0.2
    });
    this.map?.addLayer(marker);
    this.map?.addLayer(circle);

    const update = (evt: L.LocationEvent) => {
      if (!this.map) {
        return;
      }

      circle.setRadius(evt.accuracy/2);
      circle.setLatLng(evt.latlng);
      marker.setLatLng(evt.latlng);

      if (!this.map?.hasLayer(marker)) marker.addTo(this.map as L.Map);
      if (!this.map?.hasLayer(circle)) circle.addTo(this.map as L.Map);
    };
  
    this.map?.on('locationfound', update)
    .on('locationerror', (e) => {
      console.log(e);
    });
  }

  private zoomableMarker(feature: Feature, latlng: L.LatLngExpression, config: GeoJSONConfiguration) {
    const label = String(feature.properties?.name ?? feature.properties?.NAME) // Must convert to string, .bindTooltip can't use straight 'feature.properties.attribute'

    const marker = new L.Marker(latlng, {
      icon: this.makeMarker(feature, this.map?.getZoom() ?? LABEL_BASE_ZOOM)
    }).bindTooltip(label, { permanent: true, opacity: 0 });

    const update = () => {
      if (!this.map) {
        return;
      }
      const z = this.map.getZoom();
      if (z < LABEL_SHOW_FROM) {

        if (!this.map.hasLayer(marker)) marker.addTo(this.map as L.Map);

        marker.setIcon(this.makeMarker(feature, z));
      } else if (this.map.hasLayer(marker)) {
        this.map.removeLayer(marker);
      }
    };

    setTimeout(() => update(), 100);
    this.map?.on('zoomend', update);
    return marker;
  }

  private zoomableLabel(feature: Feature, layer: Layer, config: GeoJSONConfiguration) {
    if (feature.geometry.type !== 'Point' || !this.map) return;

    // biome-ignore lint/suspicious/noExplicitAny: internal property
    const label = L.marker((layer as any)._latlng, {
      icon: this.makeLabel(feature, config, this.map.getZoom()),
    });

    const update = () => {
      if (!this.map) {
        return;
      }
      const z = this.map.getZoom();
      if (z >= LABEL_SHOW_FROM) {

        if (!this.map.hasLayer(label)) label.addTo(this.map as L.Map);
        
        label.setIcon(this.makeLabel(feature, config, z));
      } else if (this.map.hasLayer(label)) {
        this.map.removeLayer(label);
      }
    };

    update();
    this.map.on('zoomend', update);
  }

  private makeMarker(feature: Feature, zoom: number) {
    const scale = MARKER_SCALE_STEP ** (zoom - MARKER_BASE_ZOOM);

    const href = feature.properties?.href;
    const transform = `display: flex; transform: scale(${scale});`;
    const color = feature.properties?.stroke ? `color:${feature.properties.stroke};` : '';
    const style = [transform, color].join('');
    const className = ['map-marker', feature.properties?.additionalType].filter(Boolean).join(' ');

    const html = `
      <a href=${href} class="article-wikilink">
        <span class="${className}" style="${style}"></span>
      </a>
    `;

    return L.divIcon({
      className: '',
      html,
      iconSize: [10, 10],
    });
  }

  private makeLabel(feature: Feature, config: GeoJSONConfiguration, zoom: number) {
    const scale = LABEL_SCALE_STEP ** (zoom - LABEL_BASE_ZOOM);
    const name = (feature.properties?.name ?? feature.properties?.NAME ?? '').toString();

    const transform = `display: flex; transform: scale(${scale});`;
    const color = feature.properties?.stroke ? `color:${feature.properties.stroke};` : '';
    const style = [transform, color].join('');
    const className = ['map-label', feature.properties?.additionalType].filter(Boolean).join(' ');

    const content = `<span style="${style}">${name}</span>`;
    const html = feature.properties?.href ?? config.href
      ? `<a class="article-wikilink" href="${feature.properties?.href ?? config.href}">${content}</a>`
      : content;

    return L.divIcon({
      className,
      html,
      iconSize: [100, 40],
      // iconAnchor: [w / 2, h / 2], // centra el texto
      // pane: 'labels',
    });
  }

  private loadData(type: string, id?: string): Promise<string> {
    const scriptElements = this.getScriptElements(type, id);
    if (scriptElements.length === 0) {
      return new Promise((_, reject) => {
        reject(`${type} / ${id} not found`);
      });
    }
    if (scriptElements.length > 1) {
      console.warn('leaflet-map', this.id, 'more than one matching data block found, using first', type, id);
    }
    return this.loadDataFromScript(scriptElements[0] as HTMLScriptElement);
  }

  private loadDataFromScript(scriptElement: HTMLScriptElement): Promise<string> {
    return new Promise((resolve, reject) => {
      if (scriptElement.src === '') {
        resolve(scriptElement.innerText);
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", scriptElement.src);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(`${xhr.status} ${xhr.statusText}`);
            }
          }
        };
        xhr.send();
      }
    });
  }

  private getScriptElements(type: string, id?: string): HTMLScriptElement[] {
    this.scriptElements = Array.from(this.querySelectorAll('script'));

    const scriptElements: HTMLScriptElement[] = [];
    for (let i = 0; i < this.scriptElements.length; i++) {
      const el = this.scriptElements[i];
      if (el instanceof HTMLScriptElement) {
        if ((el.type === type) && ((id === undefined) || (el.id === id))) {
          scriptElements.push(el);
        }
      }
    }
    return scriptElements;
  }
}

// Tell the browser to use our AstroHeart class for <astro-heart> elements.
customElements.define('map-view', LeafletMap);