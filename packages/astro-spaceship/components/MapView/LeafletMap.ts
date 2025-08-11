
import L, { Control, ImageOverlay, GeoJSON, type Layer, Map as LMap, TileLayer, VideoOverlay } from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';
import type { Configuration, GeoJSONConfiguration, LayerConfiguration } from './LeafletMapConfig';

import 'leaflet-simplestyle';

class LeafletMap extends HTMLElement {

  // #map
  private mapElement!: HTMLDivElement;
  private scriptElements!: Array<HTMLElement>;

  private map: LMap | undefined;

  connectedCallback() {
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
          const label = String(feature.properties.name ?? feature.properties.NAME) // Must convert to string, .bindTooltip can't use straight 'feature.properties.attribute'
          return new L.CircleMarker(latlng, {
            radius: 1,
          }).bindTooltip(label, { permanent: true, opacity: 0 });
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
              (layer as any).useSimpleStyle();
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
    // if (feature.geometry.type === 'MultiPolygon') {
    //   const label = L.marker(layer._bounds.getCenter(), {
    //     icon: L.divIcon({
    //       className: 'label',
    //       html: feature.properties.NAME,
    //       iconSize: [100, 40]
    //     })
    //   })
    //   .addTo(this.map);
    // }

    if (feature.geometry.type === 'Point') {
      const isCity = !!feature.properties?.name;

      const content = `<span style="${feature.properties?.stroke ? `color:${feature.properties.stroke}` : ''}">${feature.properties?.name ?? feature.properties?.NAME.toUpperCase()}</span>`;


      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const label = L.marker((layer as any)._latlng, {
        icon: L.divIcon({
          className: `label ${isCity ? 'label-city font-heading' : 'label-region font-title'}`,
          html: config.href ? `<a href=${feature.properties?.href ?? config.href}>${content}</a>` : content,
          iconSize: [100, 40],
        })
      })
        .addTo(this.map as LMap);
    }

    // const tooltip = DomUtil.create('div');
    // const table = DomUtil.create('table', undefined, tooltip);
    // const thead = DomUtil.create('thead', undefined, table);
    // const trHead = DomUtil.create('tr', undefined, thead);
    // const thName = DomUtil.create('th', undefined, trHead);
    // thName.innerHTML = 'Name';
    // const thValue = DomUtil.create('th', undefined, trHead);
    // thValue.innerHTML = 'Value';
    // const tbody = DomUtil.create('tbody', undefined, table);
    // if (feature.properties !== null) {
    //   for (let key in feature.properties) {
    //     const value = feature.properties[key];
    //     const tr = DomUtil.create('tr', undefined, tbody);
    //     const tdName = DomUtil.create('td', undefined, tr);
    //     tdName.innerHTML = key;
    //     const tdValue = DomUtil.create('td', undefined, tr);
    //     tdValue.innerHTML = value;
    //   }
    // }
    // layer.bindTooltip(tooltip);
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