import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import * as ol from 'ol';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { fromLonLat, transformExtent } from 'ol/proj';
import { RefreshCw, Filter, Columns, SlidersHorizontal, Ruler, Layers, Map as MapIcon, Compass, Globe, MousePointer2, MapPin, Info, EyeOff, Trash2, Box, Database, Search, Link as LinkIcon, Plus, ChevronRight, ChevronDown, CheckSquare, Square, MoreHorizontal, Hexagon, Minus, PenTool, GripVertical, X, ChevronUp, Sliders, TableProperties } from 'lucide-react';
import BaseLayer from 'ol/layer/Base';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs('EPSG:32717', '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32718', '+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32719', '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
register(proj4);


import DraggableWidget from './DraggableWidget';
import FeatureFormModal from './FeatureFormModal';
import Feature from 'ol/Feature';

// Cesium debe estar en el objeto global para que ol-cesium funcione en Vite
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

type Tool = 'Polygon' | 'LineString' | 'Point' | 'Modify' | 'Basemap' | 'AddLayer' | null;

interface LayerItem {
  id: string;
  title: string;
  visible: boolean;
  opacity: number;
  layer: BaseLayer;
  isCustom?: boolean;
  isGroup?: boolean;
  children?: LayerItem[];
}

const BASEMAPS = [
  { id: 'osm', name: 'OpenStreetMap', getSource: () => new OSM() },
  { id: 'satellite', name: 'Satélite (Esri)', getSource: () => new XYZ({ 
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
      maxZoom: 23 
    }) 
  },
  { id: 'topo', name: 'Topográfico (Esri)', getSource: () => new XYZ({ 
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 23
    }) 
  },
];

interface MapComponentProps {
  mode?: 'client' | 'admin';
}

const MapComponent: React.FC<MapComponentProps> = ({ mode = 'client' }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const sourceRef = useRef<VectorSource | null>(null);
  const baseLayerRef = useRef<TileLayer<OSM | XYZ | TileArcGISRest> | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const ol3dRef = useRef<any>(null); // Referencia a la instancia de OLCesium

  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [layersList, setLayersList] = useState<LayerItem[]>([]);
  const [isLayerListOpen, setIsLayerListOpen] = useState(true);
  const [activeBasemapId, setActiveBasemapId] = useState('osm');
  const [is3DMode, setIs3DMode] = useState(false);
  
  const [layerSearchQuery, setLayerSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{title: string, headers: string[], rows: any[]} | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isTableMinimized, setIsTableMinimized] = useState(true);
  const [tableHeight, setTableHeight] = useState(256);

  // Estados para la herramienta de Añadir Capas
  const [customLayerUrl, setCustomLayerUrl] = useState('');
  const [customLayerTitle, setCustomLayerTitle] = useState('');
  const [customLayerFile, setCustomLayerFile] = useState<File | null>(null);
  const [addMode, setAddMode] = useState<'url' | 'file'>('url');
  const [pendingFeature, setPendingFeature] = useState<{feature: Feature, type: string} | null>(null);

  
  const loadServerDrawings = async () => {
    try {
      const res = await fetch('https://gimatc.pe/guardar_mapa.php');
      if (res.ok) {
        const geojson = await res.json();
        if (geojson && geojson.features && geojson.features.length > 0) {
          const format = new GeoJSON();
          const features = format.readFeatures(geojson, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
          if (sourceRef.current) {
             sourceRef.current.clear();
             sourceRef.current.addFeatures(features);
          }
        }
      }
    } catch (e) {
      console.error("Error al cargar dibujos:", e);
    }
  };

  const saveServerDrawings = async () => {
    if (!sourceRef.current) return;
    try {
      const format = new GeoJSON();
      const geojson = format.writeFeaturesObject(sourceRef.current.getFeatures(), { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
      
      const res = await fetch('https://gimatc.pe/guardar_mapa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geojson)
      });
      
      if (res.ok) {
        alert('Dibujos guardados en tu servidor cPanel exitosamente.');
      } else {
        alert('Error al guardar en el servidor.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al servidor.');
    }
  };

  useEffect(() => {
    const source = new VectorSource();
    sourceRef.current = source;

    const vectorLayer = new VectorLayer({
      source: source,
      style: {
        'fill-color': 'rgba(255, 100, 50, 0.4)',
        'stroke-color': '#444',
        'stroke-width': 2,
        'circle-radius': 6,
        'circle-fill-color': '#ff4444',
      },
      zIndex: 1000 // Asegurar que los dibujos estén por encima
    });
    vectorLayer.set('title', 'Capa de Dibujos Geológicos');

    const baseLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0
    });
    baseLayer.set('title', 'Mapa Base');
    baseLayerRef.current = baseLayer as TileLayer<OSM | XYZ>;

    const map = new Map({
      target: mapElement.current!,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: fromLonLat([-75.0, -10.0]),
        zoom: 5,
      }),
    });

    mapRef.current = map;

    // Inyectar Cesium y ol en el entorno global ANTES de importar ol-cesium
    (window as any).Cesium = Cesium;
    (window as any).ol = ol;

    // Importación dinámica para evitar el problema de "hoisting" de los imports de ES6
    import('ol-cesium').then((module) => {
      try {
        const OLCesiumClass = module.default || (module as any);
        const ol3d = new OLCesiumClass({ map: map });
        ol3dRef.current = ol3d;
        
        if (is3DMode) {
          ol3d.setEnabled(true);
        }
      } catch (e) {
        console.error("Error inicializando Cesium:", e);
      }
    }).catch(err => {
      console.error("No se pudo cargar ol-cesium", err);
    });

    // Restaurado: Esto es lo que faltaba llamar
    loadSavedLayers(map);
    loadServerDrawings();

    // Actualizar lista inicial
    updateLayersList(map);
    
    // Auto-actualizar cuando lleguen capas asíncronas
    const layerCollection = map.getLayers();
    const handleLayerChange = () => updateLayersList(map);
    layerCollection.on('add', handleLayerChange);
    layerCollection.on('remove', handleLayerChange);

    return () => {
      layerCollection.un('add', handleLayerChange);
      layerCollection.un('remove', handleLayerChange);
      map.setTarget(undefined);
      mapRef.current = null;
      if (ol3dRef.current) {
        ol3dRef.current.setEnabled(false);
      }
    };
  }, []);

  const updateLayersList = (map: Map) => {
    const buildTree = (layersColl: any): LayerItem[] => {
      const list: LayerItem[] = [];
      layersColl.forEach((layer: any, index: number) => {
        if (layer === baseLayerRef.current) return;
        if (layer.get('title') === 'Capa de Dibujos Geológicos') return;
        
        let layerId = layer.get('id');
        if (!layerId) {
          layerId = `layer-${Math.random().toString(36).substr(2, 9)}`;
          layer.set('id', layerId);
        }

        const isGroup = layer.get('isGroup') === true || (layer.getLayers && typeof layer.getLayers === 'function');
        let children: LayerItem[] = [];
        if (isGroup) {
          children = buildTree(layer.getLayers());
        }

        list.push({
          id: layerId,
          title: layer.get('title') || `Capa ${index + 1}`,
          layer: layer as BaseLayer,
          visible: layer.getVisible(),
          opacity: Math.round((layer.getOpacity() || 1) * 100),
          isCustom: layer.get('isCustom') || false,
          isGroup,
          children
        });
      });
      return list;
    };

    const currentLayers = buildTree(map.getLayers());
    setLayersList(currentLayers.reverse());
  };

  const loadSavedLayers = async (map: Map) => {
    // 1. CARGAR CAPAS DE USUARIO (Plano)
    try {
      const saved = localStorage.getItem('saved_layers');
      if (saved) {
        const layersToLoad = JSON.parse(saved);
        if (Array.isArray(layersToLoad)) {
          layersToLoad.forEach(async (layerData: any) => {
            if (!layerData || !layerData.url) return;
            
            let finalUrl = layerData.url;
            let params: any = {};
            
            const match = finalUrl.match(/^(.*?\/MapServer)\/?(\d+)?$/i);
            if (match) {
              finalUrl = match[1];
              const layerId = match[2];
              if (layerId) params = { 'LAYERS': `show:${layerId}` };
            }

            const newLayer = new TileLayer({
              source: new TileArcGISRest({ url: finalUrl, params: params }),
              zIndex: map.getLayers().getLength()
            });
            
            newLayer.set('title', layerData.title);
            newLayer.set('isCustom', true);
            newLayer.set('originalUrl', layerData.url);
            
            map.addLayer(newLayer);
          });
        }
      }
    } catch (e: any) {
      console.error("Error cargando capas de usuario:", e);
    }

    // 2. CARGAR CAPAS DE ADMINISTRADOR (Árbol)
    try {
      const adminSaved = localStorage.getItem('admin_layers');
      if (adminSaved) {
        const adminNodes = JSON.parse(adminSaved);
        if (Array.isArray(adminNodes)) {
          const { buildLayerTree } = await import('../utils/layerBuilder');
          const rootLayers = await buildLayerTree(adminNodes);
          rootLayers.forEach(layer => map.addLayer(layer));
        }
      }
    } catch (e: any) {
      console.error("Error cargando árbol de admin:", e);
    }
  };

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    const source = new VectorSource();
    sourceRef.current = source;

    const vectorLayer = new VectorLayer({
      source: source,
      style: {
        'fill-color': 'rgba(255, 100, 50, 0.4)',
        'stroke-color': '#444',
        'stroke-width': 2,
        'circle-radius': 6,
        'circle-fill-color': '#ff4444',
      },
      zIndex: 1000
    });
    vectorLayer.set('title', 'Capa de Dibujos Geológicos');

    const baseLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0
    });
    baseLayer.set('title', 'Mapa Base');
    baseLayerRef.current = baseLayer as TileLayer<OSM | XYZ | TileArcGISRest>;

    const map = new Map({
      target: mapElement.current,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: fromLonLat([-75.0, -10.0]),
        zoom: 5,
      }),
    });

    mapRef.current = map;

    // Inyectar Cesium y ol en el entorno global ANTES de importar ol-cesium
    (window as any).Cesium = Cesium;
    (window as any).ol = ol;

    // Importación dinámica para evitar el problema de "hoisting" de los imports de ES6
    import('ol-cesium').then((module) => {
      try {
        const OLCesiumClass = module.default || (module as any);
        const ol3d = new OLCesiumClass({ map: map });
        ol3dRef.current = ol3d;
        
        if (is3DMode) {
          ol3d.setEnabled(true);
        }
      } catch (e) {
        console.error("Error inicializando Cesium:", e);
      }
    }).catch(err => {
      console.error("No se pudo cargar ol-cesium", err);
    });

    // Cargar capas personalizadas previamente guardadas
    loadSavedLayers(map);
    
    updateLayersList(map);

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      if (ol3dRef.current) {
        ol3dRef.current.setEnabled(false);
      }
    };
  }, []);

  // Efecto para activar o desactivar el 3D
  useEffect(() => {
    if (ol3dRef.current) {
      ol3dRef.current.setEnabled(is3DMode);
    }
  }, [is3DMode]);

  useEffect(() => {
    const map = mapRef.current;
    const source = sourceRef.current;
    if (!map || !source) return;

    if (drawRef.current) map.removeInteraction(drawRef.current);
    if (modifyRef.current) map.removeInteraction(modifyRef.current);
    if (snapRef.current) map.removeInteraction(snapRef.current);

    if (activeTool === 'Modify') {
      modifyRef.current = new Modify({ source: source });
      map.addInteraction(modifyRef.current);
    } else if (activeTool && activeTool !== 'Basemap' && activeTool !== 'AddLayer') {
      drawRef.current = new Draw({
        source: source,
        type: activeTool,
      });
      map.addInteraction(drawRef.current);
    }

    if (activeTool && activeTool !== 'Basemap' && activeTool !== 'AddLayer') {
      snapRef.current = new Snap({ source: source });
      map.addInteraction(snapRef.current);
    }
  }, [activeTool]);

  const toggleLayerVisibility = (id: string) => {
    if (!mapRef.current) return;
    const toggleRecursive = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (layer.get('id') === id) {
          layer.setVisible(!layer.getVisible());
        }
        if ((layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          toggleRecursive(layer.getLayers());
        }
      });
    };
    toggleRecursive(mapRef.current.getLayers());
    updateLayersList(mapRef.current);
  };



  

  const zoomToLayer = (id: string) => {
    if (!mapRef.current) return;
    
    let targetLayer: any = null;
    const findLayer = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (targetLayer) return;
        if (layer.get('id') === id) targetLayer = layer;
        if (!targetLayer && (layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          findLayer(layer.getLayers());
        }
      });
    };
    findLayer(mapRef.current.getLayers());

    if (!targetLayer) {
        console.warn("Capa no encontrada en el mapa.");
        return;
    }

    const source = typeof targetLayer.getSource === 'function' ? targetLayer.getSource() : null;
    let arcgisUrl = targetLayer.get('originalUrl') || targetLayer.get('url') || '';
    if (!arcgisUrl && source) {
        if (typeof source.getUrls === 'function' && source.getUrls()?.length > 0) arcgisUrl = source.getUrls()[0];
        else if (typeof source.getUrl === 'function' && source.getUrl()) arcgisUrl = source.getUrl();
    }

    
    // 0. Vector
    if (source && typeof source.getExtent === 'function') {
        const extent = source.getExtent();
        if (extent && extent[0] !== Infinity && extent[0] !== -Infinity) {
            mapRef.current!.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            return;
        }
    }

    // 1. TIFF
    if (source && typeof source.getView === 'function') {
        const viewPromise = source.getView();
        if (viewPromise && typeof viewPromise.then === 'function') {
            viewPromise.then((viewConfig: any) => {
                let finalExtent = viewConfig.extent;
                if (viewConfig.projection && viewConfig.projection !== 'EPSG:3857') {
                    const projCode = typeof viewConfig.projection.getCode === 'function' ? viewConfig.projection.getCode() : viewConfig.projection;
                    finalExtent = transformExtent(viewConfig.extent, projCode, 'EPSG:3857');
                }
                mapRef.current!.getView().fit(finalExtent, { duration: 800, padding: [50, 50, 50, 50] });
            });
            return;
        }
    }

    // 2. ArcGIS
    if (arcgisUrl && typeof arcgisUrl === 'string' && arcgisUrl.includes('MapServer')) {
        let url = arcgisUrl;
        const params = source && typeof source.getParams === 'function' ? source.getParams() : {};
        let layerId = "0"; // Default
        
        if (url.endsWith('MapServer') || url.endsWith('MapServer/')) {
            if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
                layerId = String(params.LAYERS).split(':')[1];
                if (!url.endsWith('/')) url += '/';
                url = url + layerId;
            } else {
                if (!url.endsWith('/')) url += '/';
                url = url + "0"; // Try querying layer 0 as fallback
            }
        }

        const queryUrl = url + '/query?where=1=1&returnExtentOnly=true&f=pjson';
        const callbackName = 'jsonp_' + Math.round(1000000 * Math.random());
        const script = document.createElement('script');
        script.src = queryUrl + '&callback=' + callbackName;
        
        let jsonpTimeout = setTimeout(() => {
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            console.warn("JSONP Timeout - Fallback a Perú");
            const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
            mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        }, 2000);

        (window as any)[callbackName] = (data: any) => {
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            
            let ext = data.extent || data.fullExtent;
            if (ext && ext.xmin !== undefined) {
                const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                let code = 'EPSG:' + wkid;
                try {
                    const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                    if (Math.abs(ext.xmax - ext.xmin) > 30) {
                        const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                        mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
                    } else {
                        mapRef.current!.getView().fit(transformed, { duration: 1000, padding: [50, 50, 50, 50] });
                    }
                } catch (e) {
                    const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                    mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
                }
            } else {
                const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
        };
        
        script.onerror = () => {
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
            mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        };
        
        document.body.appendChild(script);
        return;
    }

    // 3. Fallback Tradicional para SHP/GeoJSON
    let extent;
    if (typeof targetLayer.getExtent === 'function' && targetLayer.getExtent()) {
        extent = targetLayer.getExtent();
    } else if (source) {
        if (typeof source.getExtent === 'function' && source.getExtent()) {
            extent = source.getExtent();
        } else if (typeof source.getTileGrid === 'function') {
            const tg = source.getTileGrid();
            if (tg && typeof tg.getExtent === 'function') extent = tg.getExtent();
        }
    }
    
    if (extent && extent.every((val: any) => isFinite(val))) {
        // Expandimos ligeramente para no pegar a los bordes
        mapRef.current!.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
    } else {
        const sourceExtent = source && typeof source.getExtent === 'function' ? source.getExtent() : null;
        if (sourceExtent && sourceExtent.every(isFinite)) {
            mapRef.current!.getView().fit(sourceExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        }
    }
};

  const removeCustomLayer = (_id: string, layer: BaseLayer) => {
    if (!mapRef.current) return;
    
    // Eliminar del mapa
    mapRef.current.removeLayer(layer);
    updateLayersList(mapRef.current);
    
    // Eliminar del localStorage
    const originalUrl = layer.get('originalUrl');
    if (originalUrl) {
      try {
        const saved = JSON.parse(localStorage.getItem('saved_layers') || '[]');
        const filtered = saved.filter((s: any) => s.url !== originalUrl);
        localStorage.setItem('saved_layers', JSON.stringify(filtered));
      } catch(e) {
        console.error("Error al borrar capa guardada", e);
      }
    }
  };

  const changeBasemap = (basemapId: string) => {
    const basemap = BASEMAPS.find(b => b.id === basemapId);
    if (basemap && baseLayerRef.current) {
      baseLayerRef.current.setSource(basemap.getSource());
      setActiveBasemapId(basemapId);
      
      setLayersList(prevList => prevList.map(item => {
        if (item.layer === baseLayerRef.current) {
          return { ...item, title: `Mapa Base (${basemap.name})` };
        }
        return item;
      }));
    }
  };

  const handleAddCustomLayer = async () => {
    if (!mapRef.current) return;

    if (addMode === 'url') {
      if (!customLayerUrl) return;
      try {
        const urlToSave = customLayerUrl.trim();
        let finalUrl = urlToSave;
        let params: any = {};
        
        const match = finalUrl.match(/^(.*?\/MapServer)\/?(\d+)?$/i);
        if (match) {
          finalUrl = match[1];
          const layerId = match[2];
          if (layerId) {
            params = { 'LAYERS': `show:${layerId}` };
          }
        }

        const newLayer = new TileLayer({
          source: new TileArcGISRest({
            url: finalUrl,
            params: params
          }),
          zIndex: mapRef.current.getLayers().getLength()
        });
        
        const title = customLayerTitle || (match && match[2] ? `Capa ${match[2]} (Servicio de Mapa)` : 'Servicio de Mapa ArcGIS');
        newLayer.set('title', title);
        newLayer.set('isCustom', true);
        newLayer.set('originalUrl', urlToSave);
        
        mapRef.current.addLayer(newLayer);
        
        // Guardar en LocalStorage para persistencia
        const savedLayers = JSON.parse(localStorage.getItem('saved_layers') || '[]');
        // Evitar duplicados exactos
        if (!savedLayers.some((s: any) => s.url === urlToSave)) {
          savedLayers.push({ url: urlToSave, title: title });
          localStorage.setItem('saved_layers', JSON.stringify(savedLayers));
        }
        
        updateLayersList(mapRef.current);
        
        setCustomLayerUrl('');
        setCustomLayerTitle('');
        setActiveTool(null);
        setIsLayerListOpen(true);
        
      } catch (error) {
        alert("Error al añadir la capa. Verifica que el enlace sea válido.");
        console.error(error);
      }
    } else {
      if (!customLayerFile) return;
      try {
        const { parseFileToLayer } = await import('../utils/fileLayerUtils');
        const newLayer = await parseFileToLayer(customLayerFile, customLayerFile.name);
        newLayer.set('title', customLayerTitle || customLayerFile.name);
        newLayer.set('isCustom', true);
        
        mapRef.current.addLayer(newLayer);
        
        updateLayersList(mapRef.current);
        
        setCustomLayerFile(null);
        setCustomLayerTitle('');
        setActiveTool(null);
        setIsLayerListOpen(true);
      } catch (err: any) {
        console.error('Error parseando archivo:', err);
        alert('Error al procesar el archivo: ' + err.message);
      }
    }
  };

  
  
  const handleAddToTable = (item: LayerItem) => {
    if (!item.layer) return;
    setIsLoadingTable(true);
    setTableData(null);
    setIsTableMinimized(false);

    const layerTitle = item.title;
    let arcgisUrl = item.layer.get('originalUrl') || item.layer.get('url') || '';
    const source = typeof (item.layer as any).getSource === 'function' ? (item.layer as any).getSource() : null;

    if (!arcgisUrl && source) {
        if (typeof (source as any).getUrls === 'function' && (source as any).getUrls()?.length > 0) arcgisUrl = (source as any).getUrls()[0];
        else if (typeof (source as any).getUrl === 'function' && (source as any).getUrl()) arcgisUrl = (source as any).getUrl();
    }

    if (source && typeof (source as any).getFeatures === 'function') {
      const features = (source as any).getFeatures();
      if (features.length > 0) {
        const firstProps = features[0].getProperties();
        const headers = Object.keys(firstProps).filter(k => k !== 'geometry');
        const rows = features.map((f: any) => {
          const props = f.getProperties();
          const rowData: any = {};
          headers.forEach(h => rowData[h] = props[h]);
          return rowData;
        });
        setTableData({ title: layerTitle, headers, rows });
        setIsLoadingTable(false);
        return;
      }
    }

    if (arcgisUrl && typeof arcgisUrl === 'string' && arcgisUrl.toLowerCase().includes('mapserver')) {
      let url = arcgisUrl;
      const params = source && typeof (source as any).getParams === 'function' ? (source as any).getParams() : {};
      
      if (url.endsWith('/')) url = url.slice(0, -1);
      
      if (url.toLowerCase().endsWith('mapserver')) {
          if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
              const layerId = String(params.LAYERS).split(':')[1];
              url = url + '/' + layerId;
          } else {
              url = url + '/0';
          }
      }

      if (url.toLowerCase().includes('/query')) {
          url = url.substring(0, url.toLowerCase().indexOf('/query'));
      }

      const queryUrl = url + '/query?where=1=1&outFields=*&returnGeometry=false&f=pjson';

      const callbackName = 'jsonp_table_' + Math.round(1000000 * Math.random());
      const script = document.createElement('script');
      script.src = queryUrl + '&callback=' + callbackName;

      let jsonpTimeout = setTimeout(() => {
          if (document.body.contains(script)) document.body.removeChild(script);
          delete (window as any)[callbackName];
          setIsLoadingTable(false);
          alert('Tiempo de espera agotado al obtener datos de la tabla.');
      }, 15000);

      (window as any)[callbackName] = (data: any) => {
          clearTimeout(jsonpTimeout);
          if (document.body.contains(script)) document.body.removeChild(script);
          delete (window as any)[callbackName];
          setIsLoadingTable(false);
          
          if (data && data.features && data.features.length > 0) {
              const headers = data.fields ? data.fields.map((f: any) => f.name) : Object.keys(data.features[0].attributes);
              const rows = data.features.map((f: any) => f.attributes);
              setTableData({ title: layerTitle, headers, rows });
          } else {
              alert('No se encontraron atributos para esta capa.');
          }
      };
      
      script.onerror = () => {
          clearTimeout(jsonpTimeout);
          if (document.body.contains(script)) document.body.removeChild(script);
          delete (window as any)[callbackName];
          setIsLoadingTable(false);
          alert('Error de red al intentar obtener los atributos.');
      };
      
      document.body.appendChild(script);
      return;
    }

    setIsLoadingTable(false);
    alert('No se pueden extraer atributos de este tipo de capa o la capa está vacía.');
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    if (!mapRef.current) return;
    const updateOpacityRecursive = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (layer.get('id') === id) {
          layer.setOpacity(opacity / 100);
        }
        if ((layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          updateOpacityRecursive(layer.getLayers());
        }
      });
    };
    updateOpacityRecursive(mapRef.current.getLayers());
    updateLayersList(mapRef.current);
  };

  const toggleGroupExpanded = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderUserLayerTree = (nodes: LayerItem[], depth: number = 0) => {
    let displayNodes = nodes;
    if (depth === 0 && layerSearchQuery) {
      const query = layerSearchQuery.toLowerCase();
      const filterRecursive = (items: LayerItem[]): LayerItem[] => {
        const result: LayerItem[] = [];
        items.forEach(item => {
          if (item.title.toLowerCase().includes(query)) {
            result.push(item);
          } else if (item.children) {
            const childMatches = filterRecursive(item.children);
            if (childMatches.length > 0) result.push({ ...item, children: childMatches });
          }
        });
        return result;
      };
      displayNodes = filterRecursive(nodes);
    }

    return displayNodes.map(item => {
      const isExpanded = !!expandedGroups[item.id];
      const hasMenuOpen = activeMenuId === item.id;
      return (
        <div key={item.id} className="text-[11px] select-none">
          <div onDoubleClick={() => zoomToLayer(item.id)} className="flex items-center justify-between p-1.5 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors relative cursor-pointer"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <div className="flex items-center gap-1.5 overflow-hidden flex-1">
              <div className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical size={14} />
              </div>

              {item.isGroup ? (
                <button onClick={(e) => { e.stopPropagation(); toggleGroupExpanded(item.id); }} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className="w-3.5" />
              )}
              
              <button onClick={() => toggleLayerVisibility(item.id)} className="text-gray-700 hover:text-black focus:outline-none ml-1">
                {item.visible ? <CheckSquare size={14} className="text-blue-600 bg-white rounded-sm" /> : <Square size={14} className="text-gray-400" />}
              </button>
              
              <span className={`truncate flex-1 text-gray-800 tracking-wide ml-1 ${item.isGroup ? 'font-medium' : ''}`} title={item.title}>{item.title.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-0.5 pr-1">
              {!item.isGroup && (
                <button 
                  onClick={(e) => { e.stopPropagation(); zoomToLayer(item.id); }} 
                  className="p-1 rounded text-gray-400 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                  title="Acercar a esta capa"
                >
                  <Search size={14}/>
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(hasMenuOpen ? null : item.id); }} 
                className={`p-1 rounded transition-colors ${hasMenuOpen ? 'bg-gray-200 text-black' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-800'}`}
              >
                <MoreHorizontal size={14}/>
              </button>
            </div>

            {hasMenuOpen && (
              <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 shadow-xl rounded-sm z-50 flex flex-col py-1 text-xs text-gray-700" onClick={(e) => e.stopPropagation()}>
                {item.isCustom && (
                  <button onClick={() => { removeCustomLayer(item.id, item.layer); setActiveMenuId(null); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full text-red-600 font-medium">
                    <Trash2 size={14} /> Eliminar Capa
                  </button>
                )}
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <EyeOff size={14} /> Deshabilitar elemento emergente
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Sliders size={14} /> Rango de visibilidad
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Info size={14} /> Detalles
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Search size={14} /> Definir filtro
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Square size={14} /> Calcular estadísticas
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full font-medium text-blue-700 bg-blue-50/50"
                  onClick={() => { handleAddToTable(item); setActiveMenuId(null); }}
                >
                  <TableProperties size={14} /> Agregar a tabla
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full justify-between">
                  <div className="flex items-center gap-2"><MapIcon size={14} /> Exportar</div>
                  <ChevronRight size={14} />
                </button>
                <div className="h-px bg-gray-200 my-1 mx-2"></div>
                <div className="px-3 py-2 flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-medium text-gray-600"><Sliders size={12} /> Transparencia: {100 - item.opacity}%</span>
                  <input 
                    type="range" min="0" max="100" value={item.opacity} 
                    onChange={(e) => handleOpacityChange(item.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-gray-700 mt-1"
                  />
                </div>
              </div>
            )}
          </div>
          
          {item.isGroup && isExpanded && item.children && (
            <div>
              {renderUserLayerTree(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50">
      <div className="h-14 bg-[#0A2A1A] flex items-center justify-between px-6 text-white z-40 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-wider text-[#4ADE80]">Y</span>
              <span className="font-semibold text-xl tracking-widest text-gray-100">UMESOKA</span>
            </div>
            <div className="font-bold text-[#e1c142] text-xl tracking-wide">
              SISTEMA DE INTEGRACION GEOLÓGICA
            </div>
            <div>
              <button className="bg-[#e1c142] text-[#0A2A1A] px-6 py-1.5 rounded font-bold text-sm hover:bg-[#f2d253] transition-colors shadow-sm">
                Inicio
              </button>
            </div>
          </div>
          
          <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-end px-4 gap-3 z-30 shrink-0 shadow-sm text-sm">
            {mode === 'admin' && (
              <>
                <div className="flex items-center gap-1 bg-gray-50 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors">
                  <span>Analysis Tools</span>
                  <ChevronDown size={16} />
                </div>
                
                <div className="relative group">
                  <div className="flex items-center gap-1 bg-gray-50 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors">
                    <span>Tools</span>
                    <ChevronDown size={16} />
                  </div>
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md hidden group-hover:flex flex-col py-1 z-50">
                    <button onClick={() => setActiveTool('Polygon')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><Hexagon size={16} /> Polygon</button>
                    <button onClick={() => setActiveTool('LineString')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><Minus size={16} /> LineString</button>
                    <button onClick={() => setActiveTool('Point')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><MapPin size={16} /> Point</button>
                    <button onClick={() => setActiveTool('Modify')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><PenTool size={16} /> Modify</button>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <button onClick={() => setActiveTool(activeTool === 'AddLayer' ? null : 'AddLayer')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><Database size={16} /> Add Layer</button>
                  </div>
                </div>
              </>
            )}

            
            <button 
               onClick={saveServerDrawings}
               className="flex items-center gap-2 bg-blue-600 text-white rounded px-3 py-1.5 cursor-pointer hover:bg-blue-700 font-medium transition-colors"
               title="Guardar Dibujos en cPanel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Guardar Nube</span>
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveTool(activeTool === 'Basemap' ? null : 'Basemap')} className={`p-2 rounded hover:bg-gray-100 transition ${activeTool === 'Basemap' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 border border-transparent'}`} title="Mapas Base"><Globe size={18} /></button>
              <button onClick={() => setIs3DMode(!is3DMode)} className={`p-2 rounded hover:bg-gray-100 transition ${is3DMode ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-gray-600 border border-transparent'}`} title="Vista 3D/2D"><Box size={18} /></button>
              <button onClick={() => setActiveTool(null)} className={`p-2 rounded hover:bg-gray-100 transition ${activeTool === null && !is3DMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 border border-transparent'}`} title="Navegar"><MousePointer2 size={18} /></button>
            </div>
            
            <div className="relative">
              <input type="text" placeholder="Buscar herramienta..." className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#e1c142]" />
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
            </div>
          </div>

      <div className="flex-1 w-full relative flex overflow-hidden">
        
        

        <div className="flex-1 relative bg-gray-100 flex flex-col overflow-hidden min-w-0">
          
          <div className="flex-1 relative min-w-0">
            <div ref={mapElement} className="absolute inset-0" />
            
            
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button 
                onClick={() => setIsLayerListOpen(!isLayerListOpen)} 
                className="bg-white p-2 rounded shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                title="Capas del mapa"
              >
                <Layers size={20} />
              </button>
              <button 
                onClick={() => { mapRef.current?.getView().setZoom(5); mapRef.current?.getView().setCenter(fromLonLat([-75.0, -10.0])); }} 
                className="bg-white p-2 rounded shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                title="Vista inicial"
              >
                <Globe size={20} />
              </button>
              <button 
                className="bg-white p-2 rounded shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                title="Buscar ubicación"
              >
                <Search size={20} />
              </button>
              <button 
                className="bg-white p-2 rounded shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                title="Brújula / Restablecer Norte"
                onClick={() => mapRef.current?.getView().animate({ rotation: 0, duration: 500 })}
              >
                <Compass size={20} />
              </button>
              <button 
                className={`p-2 rounded shadow-md border transition-colors ${activeTool === 'LineString' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                title="Medición (Regla)"
                onClick={() => setActiveTool(activeTool === 'LineString' ? null : 'LineString')}
              >
                <Ruler size={20} />
              </button>
            </div>

            {activeTool === 'AddLayer' && (
              <div className={`absolute ${mode === 'admin' ? 'left-4 top-1/4' : 'right-4 top-4'} bg-white rounded-xl shadow-2xl border border-gray-200 w-80 text-gray-800 flex flex-col overflow-hidden z-40`}>
                <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="text-amber-600" size={20} />
                    <h3 className="font-bold text-gray-800">Añadir Datos</h3>
                  </div>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                <div className="flex flex-col">
                  <div className="flex border-b border-gray-200">
                    <button className={`flex-1 py-2 text-xs font-medium text-center ${addMode === 'url' ? 'border-b-2 border-amber-500 text-amber-700 bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} onClick={() => setAddMode('url')}>
                      <div className="flex items-center justify-center gap-1"><LinkIcon size={14}/> URL</div>
                    </button>
                    <button className={`flex-1 py-2 text-xs font-medium text-center ${addMode === 'file' ? 'border-b-2 border-amber-500 text-amber-700 bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} onClick={() => setAddMode('file')}>
                      <div className="flex items-center justify-center gap-1"><Database size={14}/> Archivo</div>
                    </button>
                  </div>
                  <div className="p-4">
                    {addMode === 'url' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Enlace del servicio</label>
                          <input type="text" placeholder="https://..." value={customLayerUrl} onChange={(e) => setCustomLayerUrl(e.target.value)} className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre (opcional)</label>
                          <input type="text" placeholder="Mi Mapa" value={customLayerTitle} onChange={(e) => setCustomLayerTitle(e.target.value)} className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <button onClick={handleAddCustomLayer} disabled={!customLayerUrl} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
                          <Plus size={18} /> Añadir al Mapa
                        </button>
                      </div>
                    )}
                    {addMode === 'file' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-6 text-center cursor-pointer relative hover:border-amber-500 transition-colors">
                          <input type="file" onChange={e => setCustomLayerFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          {customLayerFile ? <p className="text-sm text-amber-600 font-bold break-all">{customLayerFile.name}</p> : <p className="text-xs text-gray-500">Clic o arrastra archivo aquí</p>}
                        </div>
                        <button onClick={handleAddCustomLayer} disabled={!customLayerFile} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
                          <Plus size={18} /> Procesar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'Basemap' && (
              <div className={`absolute ${mode === 'admin' ? 'left-4 top-1/2' : 'right-4 top-4'} bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-64 text-gray-800 z-40`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Mapas Base</h3>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                <div className="space-y-2">
                  {BASEMAPS.map((basemap) => (
                    <button key={basemap.id} onClick={() => changeBasemap(basemap.id)} className={`w-full text-left px-4 py-2 rounded-md text-sm transition ${activeBasemapId === basemap.id ? 'bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200' : 'hover:bg-gray-100 border border-transparent'}`}>
                      {basemap.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          

          
      {/* FORMULARIO AVANZADO MODAL */}
      {pendingFeature && (
        <FeatureFormModal 
          feature={pendingFeature.feature}
          geometryType={pendingFeature.type}
          onSave={(properties) => {
            pendingFeature.feature.setProperties(properties);
            sourceRef.current?.addFeature(pendingFeature.feature);
            setPendingFeature(null);
            // Si quieres que guarde automáticamente en la nube tras llenar el form:
            // setTimeout(() => saveServerDrawings(), 500);
          }}
          onCancel={() => {
            setPendingFeature(null);
          }}
        />
      )}

          {/* TABLA DE ATRIBUTOS (SIEMPRE RENDERIZADA) */}
          <div 
            className="bg-white flex flex-col z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 relative border-t border-gray-300"
            style={{ height: isTableMinimized ? '0px' : `${tableHeight}px` }}
          >
            {/* PESTAÑA PARA EXPANDIR (SOLO VISIBLE CUANDO ESTÁ MINIMIZADO) */}
            {isTableMinimized && (
              <div 
                className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-16 bg-[#111111] rounded-t-lg flex items-center justify-center cursor-pointer hover:bg-black transition-colors z-30"
                onClick={() => setIsTableMinimized(false)}
                title="Expandir tabla"
              >
                <ChevronUp size={16} className="text-white" />
              </div>
            )}

            {/* CONTENIDO DE LA TABLA (CUANDO NO ESTÁ MINIMIZADO) */}
            {!isTableMinimized && (
              <>
                {/* PESTAÑA PARA COLAPSAR (CUANDO ESTÁ EXPANDIDO) */}
                <div 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-16 bg-[#111111] rounded-t-lg flex items-center justify-center cursor-pointer hover:bg-black transition-colors z-30"
                  onClick={() => setIsTableMinimized(true)}
                  title="Minimizar tabla"
                >
                  <ChevronDown size={16} className="text-white" />
                </div>

                {/* Drag Handle */}
                <div 
                  className="h-2 w-full bg-gray-200 cursor-row-resize flex justify-center items-center hover:bg-gray-300"
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = tableHeight;
                    const handleMouseMove = (moveEvent: any) => {
                      const deltaY = startY - moveEvent.clientY;
                      const newHeight = Math.max(100, Math.min(window.innerHeight - 200, startHeight + deltaY));
                      setTableHeight(newHeight);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="w-8 h-1 bg-gray-400 rounded-full pointer-events-none"></div>
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                    <span className="text-gray-800 border-b-2 border-blue-500 pb-1 flex items-center gap-2">
                      {isLoadingTable ? 'Cargando datos...' : (tableData?.title || 'TABLA DE ATRIBUTOS').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <button className="hover:text-gray-800" title="Actualizar"><RefreshCw size={14} /></button>
                    <button className="hover:text-gray-800" title="Filtrar"><Filter size={14} /></button>
                    <button className="hover:text-gray-800" title="Mostrar/Ocultar columnas"><Columns size={14} /></button>
                    <button className="hover:text-gray-800" title="Opciones"><SlidersHorizontal size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => setIsTableMinimized(true)} className="hover:text-gray-800" title="Minimizar"><ChevronDown size={16} /></button>
                    <button onClick={() => {setTableData(null); setIsTableMinimized(true);}} className="hover:text-gray-800" title="Cerrar"><X size={16} /></button>
                  </div>
                </div>

                {/* Contenido (Tabla o Loading) */}
                <div className="flex-1 overflow-auto bg-white custom-scrollbar relative">
                  {isLoadingTable ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                  ) : tableData && tableData.rows.length > 0 ? (
                    <table className="w-full text-xs text-left whitespace-nowrap">
                      <thead className="bg-gray-100 text-gray-600 sticky top-0 border-b border-gray-200 shadow-sm z-10">
                        <tr>
                          {tableData.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 font-medium border-r border-gray-200">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {tableData.rows.map((row, rIndex) => (
                          <tr key={rIndex} className={`hover:bg-blue-50 ${rIndex % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                            {tableData.headers.map((h, cIndex) => (
                              <td key={cIndex} className="px-3 py-1.5 border-r border-gray-100 max-w-[200px] truncate" title={String(row[h])}>
                                {row[h] !== null && row[h] !== undefined ? String(row[h]) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No hay datos para mostrar</div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="bg-gray-100 border-t border-gray-200 px-3 py-1 text-[10px] text-gray-500 flex justify-between shrink-0">
                  <span>Total: {tableData?.rows.length || 0} | Selección: 0</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DraggableWidget 
        title="Capas del mapa" 
        isOpen={isLayerListOpen} 
        onClose={() => setIsLayerListOpen(false)}
        defaultPosition={{ x: 60, y: 120 }}
      >
        <div className="flex flex-col h-full bg-white">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar capa..." 
                className="w-full text-xs pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                value={layerSearchQuery}
                onChange={(e) => setLayerSearchQuery(e.target.value)}
              />
              <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[100px] custom-scrollbar" onClick={() => setActiveMenuId(null)}>
            {renderUserLayerTree(layersList, 0)}
          </div>
        </div>
      </DraggableWidget>
    </div>
  );
};

export default MapComponent;
