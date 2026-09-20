import localforage from 'localforage';
import * as shp from 'shpjs';
import JSZip from 'jszip';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WebGLTileLayer from 'ol/layer/WebGLTile';
import GeoTIFF from 'ol/source/GeoTIFF';
import Map from 'ol/Map';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import LayerGroup from 'ol/layer/Group';
import BaseLayer from 'ol/layer/Base';
import * as geotiff from 'geotiff';
import { transformExtent } from 'ol/proj';


// Database config
localforage.config({
  name: 'MapeoGeologico',
  storeName: 'admin_files'
});

const defaultStyle = new Style({
  fill: new Fill({
    color: 'rgba(50, 150, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: '#3296FF',
    width: 2,
  }),
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({
      color: '#3296FF',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 1,
    }),
  }),
});

export const parseFileToLayer = async (file: File | Blob, fileName: string): Promise<any> => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (ext === 'json' || ext === 'geojson') {
    const text = await file.text();
    const features = new GeoJSON().readFeatures(text, {
      featureProjection: 'EPSG:3857'
    });
    return new VectorLayer({
      source: new VectorSource({ features }),
      style: defaultStyle,
    });
  }

  if (ext === 'kmz' || ext === 'kml') {
    let kmlText = "";
    
    if (ext === 'kml') {
      kmlText = await file.text();
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const kmlFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('.kml'));
      if (!kmlFile) throw new Error("No se encontró un archivo .kml dentro del KMZ");
      
      kmlText = await kmlFile.async("text");

      // Buscar todas las etiquetas <href> para reemplazar imágenes empaquetadas por base64
      const hrefRegex = /<href>([^<]+)<\/href>/gi;
      let match;
      const matches = [];
      while ((match = hrefRegex.exec(kmlText)) !== null) {
        matches.push(match[1]);
      }

      for (const href of matches) {
        if (href.startsWith('http') || href.startsWith('data:')) continue;
        const imageFile = zip.files[href] || Object.values(zip.files).find(f => f.name.endsWith(href) || href.endsWith(f.name));
        if (imageFile) {
          try {
            const base64 = await imageFile.async("base64");
            let mimeType = 'image/png';
            if (href.toLowerCase().endsWith('.jpg') || href.toLowerCase().endsWith('.jpeg')) mimeType = 'image/jpeg';
            const dataUri = `data:${mimeType};base64,${base64}`;
            kmlText = kmlText.split(`<href>${href}<\/href>`).join(`<href>${dataUri}<\/href>`);
          } catch(e) {
            console.error("Error extrayendo imagen del kmz:", e);
          }
        }
      }
    }

    const layers: BaseLayer[] = [];

    // Parsear GroundOverlays usando DOMParser (imágenes de mapas)
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlText, "text/xml");
      const groundOverlays = xmlDoc.getElementsByTagName("GroundOverlay");
      
      for (let i = 0; i < groundOverlays.length; i++) {
        const go = groundOverlays[i];
        const icon = go.getElementsByTagName("Icon")[0];
        const latLonBox = go.getElementsByTagName("LatLonBox")[0];
        
        if (icon && latLonBox) {
          const href = icon.getElementsByTagName("href")[0]?.textContent;
          const north = parseFloat(latLonBox.getElementsByTagName("north")[0]?.textContent || "0");
          const south = parseFloat(latLonBox.getElementsByTagName("south")[0]?.textContent || "0");
          const east = parseFloat(latLonBox.getElementsByTagName("east")[0]?.textContent || "0");
          const west = parseFloat(latLonBox.getElementsByTagName("west")[0]?.textContent || "0");
          
          if (href && !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
            // extent in EPSG:4326 is [minX, minY, maxX, maxY] -> [west, south, east, north]
            const extent4326 = [west, south, east, north];
            const extent3857 = transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
            
            const imgLayer = new ImageLayer({
              source: new ImageStatic({
                url: href,
                imageExtent: extent3857,
              })
            });
            layers.push(imgLayer);
          }
        }
      }
    } catch (e) {
      console.error("Error parseando GroundOverlays:", e);
    }

    // Parsear vectores (Puntos, Líneas, Polígonos)
    const features = new KML({ extractStyles: true }).readFeatures(kmlText, {
      featureProjection: 'EPSG:3857'
    });

    if (features.length > 0) {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({ features }),
      });
      const hasStyle = features.some(f => f.getStyle() || f.getStyleFunction());
      if (!hasStyle) {
        vectorLayer.setStyle(defaultStyle);
      }
      layers.push(vectorLayer);
    }

    if (layers.length === 0) {
      throw new Error("El archivo KML/KMZ no produjo geometrías ni imágenes legibles.");
    }
    
    if (layers.length === 1) {
      return layers[0];
    } else {
      return new LayerGroup({ layers });
    }
  }

  if (ext === 'shp' || ext === 'zip') {
    // Para shapefiles, asumimos que viene en un .zip
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const geojson = await shp.parseZip(arrayBuffer);
    
    let features: any[] = [];
    if (Array.isArray(geojson)) {
      // shpjs puede devolver un arreglo si el zip tiene múltiples shapefiles
      geojson.forEach(g => {
        features = features.concat(new GeoJSON().readFeatures(g, { featureProjection: 'EPSG:3857' }));
      });
    } else {
      features = new GeoJSON().readFeatures(geojson, { featureProjection: 'EPSG:3857' });
    }
    
    return new VectorLayer({
      source: new VectorSource({ features }),
      style: defaultStyle,
    });
  }

  if (ext === 'tif' || ext === 'tiff') {
    try {
      // Intentamos usar la librería geotiff nativa para extraer un Canvas estático
      // Esto resuelve problemas con TIFFs indexados (paletas de colores) que WebGLTileLayer no procesa bien automáticamente
      const tiff = await geotiff.fromBlob(file as File);
      const image = await tiff.getImage();
      
      const width = image.getWidth();
      const height = image.getHeight();
      const bbox = image.getBoundingBox();
      const geoKeys = image.getGeoKeys();
      
      let projCode = 'EPSG:4326';
      if (geoKeys && geoKeys.ProjectedCSTypeGeoKey) {
         projCode = 'EPSG:' + geoKeys.ProjectedCSTypeGeoKey;
      }

      // Evitamos congelar el navegador si la imagen es masiva (> 8000x8000)
      if (width > 8192 || height > 8192) {
         // Fallback a WebGLTileLayer para imágenes gigantes
         console.warn('TIFF muy grande, usando WebGLTileLayer. Puede no mostrar colores indexados.');
         const source = new GeoTIFF({ sources: [{ blob: file as File }] });
         return new WebGLTileLayer({ source: source });
      }

      const rgb = await image.readRGB() as any;
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2D context');
      
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      const pixels = width * height;
      const isPlanar = Array.isArray(rgb) || (rgb.length > 0 && typeof rgb[0] !== 'number' && rgb[0].length === pixels);
      const channels = isPlanar ? rgb.length : rgb.length / pixels;
      
      let j = 0;
      for (let i = 0; i < data.length; i += 4) {
        let r, g, b, a = 255;
        
        if (isPlanar) {
          r = rgb[0][j];
          g = rgb[1][j];
          b = rgb[2][j];
          if (channels >= 4) a = rgb[3][j];
          j++;
        } else {
          r = rgb[j];
          g = rgb[j+1];
          b = rgb[j+2];
          if (channels >= 4) a = rgb[j+3];
          j += channels;
        }

        data[i] = r;
        data[i+1] = g;
        data[i+2] = b;
        
        // Transparencia para bordes negros (NoData de ArcGIS)
        if (r === 0 && g === 0 && b === 0 && (channels < 4 || a === 255)) {
           data[i+3] = 0; 
        } else {
           data[i+3] = a; 
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      const dataURL = canvas.toDataURL();
      console.log('TIFF Canvas Size:', width, 'x', height, 'DataURL length:', dataURL.length);
      
      return new ImageLayer({
        source: new ImageStatic({
          url: dataURL,
          imageExtent: bbox,
          projection: projCode
        })
      });
      
    } catch (e) {
      console.error("Error procesando TIFF manualmente, intentando WebGLTileLayer...", e);
      const source = new GeoTIFF({
        sources: [{ blob: file as File }]
      });
      return new WebGLTileLayer({ source: source });
    }
  }

  throw new Error(`Formato no soportado: .${ext}`);
};

export const saveAdminFileLayer = async (file: File, title: string) => {
  const id = `file_${Date.now()}`;
  // Guardamos el blob en IndexedDB para no petar localStorage
  await localforage.setItem(id, file);
  
  // Guardamos el registro en localStorage para integrarlo con la lista de capas Admin actual
  const adminLayers = JSON.parse(localStorage.getItem('admin_layers') || '[]');
  adminLayers.push({
    id,
    fileName: file.name,
    title: title || file.name,
    enabled: true,
    isFile: true
  });
  localStorage.setItem('admin_layers', JSON.stringify(adminLayers));
};

export const removeAdminFileLayer = async (id: string) => {
  await localforage.removeItem(id);
};

export const loadAdminFileLayerBlob = async (id: string): Promise<Blob | null> => {
  try {
    return await localforage.getItem<Blob>(id);
  } catch (e) {
    console.error("Error cargando archivo de IndexedDB", e);
    return null;
  }
};
