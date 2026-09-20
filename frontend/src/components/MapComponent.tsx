import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import * as ol from 'ol';
import Map from 'ol/Map';
import View from 'ol/View';
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
import { Layers, Map as MapIcon, Compass, Globe, Navigation, MousePointer2, Settings, Crosshair, MapPin, ZoomIn, Info, Eye, EyeOff, Trash2, Box, Database, Search, Link as LinkIcon, Plus, Folder, FolderOpen, ChevronRight, ChevronDown, CheckSquare, Square, MoreVertical, MoreHorizontal, Hexagon, Minus, PenTool, GripVertical, X, ChevronUp, Sliders } from 'lucide-react';
import BaseLayer from 'ol/layer/Base';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs('EPSG:32717', '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32718', '+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32719', '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
register(proj4);


import DraggableWidget from './DraggableWidget';

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

const MapComponent: React.FC = () => {
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

  // Estados para la herramienta de Añadir Capas
  const [addLayerTab, setAddLayerTab] = useState<'search' | 'url'>('url');
  const [customLayerUrl, setCustomLayerUrl] = useState('');
  const [customLayerTitle, setCustomLayerTitle] = useState('');
  const [customLayerFile, setCustomLayerFile] = useState<File | null>(null);
  const [addMode, setAddMode] = useState<'url' | 'file'>('url');

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

  // NUEVO ESTADO PARA ERRORES GLOBALES
  const [debugError, setDebugError] = useState<string>('Sin errores');
  const [debugCounts, setDebugCounts] = useState<{user: number, admin: number}>({user: 0, admin: 0});
  const [debugInner, setDebugInner] = useState<string>('Not run');

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

  const [debugAdminLayers, setDebugAdminLayers] = useState('...');
  useEffect(() => {
    setDebugAdminLayers(localStorage.getItem('admin_layers') || 'VACIO');
  }, []);

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

  const removeCustomLayer = (id: string, layer: BaseLayer) => {
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
          <div 
            className="flex items-center justify-between p-1.5 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors relative"
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
              <div className="absolute right-0 top-8 w-56 bg-white border border-gray-200 shadow-xl rounded-sm z-50 flex flex-col py-1 text-xs text-gray-700" onClick={(e) => e.stopPropagation()}>
                {item.isCustom && (
                  <button onClick={() => { removeCustomLayer(item.id, item.layer); setActiveMenuId(null); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left w-full text-red-600">
                    <Trash2 size={12} /> Eliminar Capa
                  </button>
                )}
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
    <div className="w-full h-full relative flex overflow-hidden">
      {/* BARRA LATERAL IZQUIERDA */}
      <div className="w-16 bg-[#2b2b2b] text-white flex flex-col items-center py-4 gap-4 z-20 shadow-2xl border-r border-gray-700 relative">
        <button onClick={() => setActiveTool(null)} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === null && !is3DMode ? 'bg-blue-600 shadow-inner' : ''}`} title="Navegar">
          <MousePointer2 size={24} />
        </button>
        <button onClick={() => setActiveTool('Polygon')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Polygon' ? 'bg-blue-600 shadow-inner' : ''}`} title="Dibujar Polígono">
          <Hexagon size={24} />
        </button>
        <button onClick={() => setActiveTool('LineString')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'LineString' ? 'bg-blue-600 shadow-inner' : ''}`} title="Dibujar Línea">
          <Minus size={24} />
        </button>
        <button onClick={() => setActiveTool('Point')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Point' ? 'bg-blue-600 shadow-inner' : ''}`} title="Añadir Punto">
          <MapPin size={24} />
        </button>
        
        <div className="w-10 h-px bg-gray-600 my-1"></div>
        
        <button onClick={() => setActiveTool('Modify')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Modify' ? 'bg-green-600 shadow-inner' : ''}`} title="Modificar vértices">
          <PenTool size={24} />
        </button>

        <div className="w-10 h-px bg-gray-600 my-1"></div>

        {/* Botón de Catálogo / Añadir Capa */}
        <button 
          onClick={() => setActiveTool(activeTool === 'AddLayer' ? null : 'AddLayer')} 
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'AddLayer' ? 'bg-amber-600 shadow-inner' : ''}`} 
          title="Añadir Datos / Catálogo"
        >
          <Database size={24} />
        </button>

        {/* Panel flotante de Añadir Capas */}
        {activeTool === 'AddLayer' && (
          <div className="absolute left-16 top-auto bg-white rounded-r-xl shadow-2xl border border-gray-200 ml-1 w-80 text-gray-800 flex flex-col overflow-hidden">
            <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-2">
              <Database className="text-amber-600" size={20} />
              <h3 className="font-bold text-gray-800">Añadir Datos</h3>
            </div>
            
            <div className="flex flex-col">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`flex-1 py-2 text-xs font-medium text-center ${addMode === 'url' ? 'border-b-2 border-amber-500 text-amber-700 bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setAddMode('url')}
                >
                  <div className="flex items-center justify-center gap-1"><LinkIcon size={14}/> URL</div>
                </button>
                <button 
                  className={`flex-1 py-2 text-xs font-medium text-center ${addMode === 'file' ? 'border-b-2 border-amber-500 text-amber-700 bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setAddMode('file')}
                >
                  <div className="flex items-center justify-center gap-1"><Database size={14}/> Archivo</div>
                </button>
              </div>

              <div className="p-4">
                {addMode === 'url' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Enlace del servicio (MapServer)</label>
                      <input 
                        type="text" 
                        placeholder="https://.../ArcGIS/rest/services/.../MapServer"
                        value={customLayerUrl}
                        onChange={(e) => setCustomLayerUrl(e.target.value)}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre para mostrar (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Mi Mapa Geológico"
                        value={customLayerTitle}
                        onChange={(e) => setCustomLayerTitle(e.target.value)}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleAddCustomLayer}
                      disabled={!customLayerUrl}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} /> Añadir al Mapa
                    </button>
                  </div>
                )}

                {addMode === 'file' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-6 text-center cursor-pointer hover:border-amber-500 transition-colors relative">
                      <input 
                        type="file" 
                        accept=".shp,.zip,.kmz,.kml,.json,.geojson,.tif,.tiff"
                        onChange={e => setCustomLayerFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {customLayerFile ? (
                        <p className="text-sm text-amber-600 font-bold break-all">{customLayerFile.name}</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Clic o arrastra archivo aquí<br/>
                          <span className="font-semibold">.shp (zip), .kml, .kmz, .geojson, .tif</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre para mostrar (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Mi Archivo Local"
                        value={customLayerTitle}
                        onChange={(e) => setCustomLayerTitle(e.target.value)}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleAddCustomLayer}
                      disabled={!customLayerFile}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} /> Procesar y Añadir
                    </button>
                    <p className="text-[10px] text-gray-400 text-center leading-tight">
                      Los archivos locales se procesan temporalmente en memoria sin subir a ningún servidor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón de Galería de Mapas Base */}
        <button 
          onClick={() => setActiveTool(activeTool === 'Basemap' ? null : 'Basemap')} 
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Basemap' ? 'bg-indigo-600 shadow-inner' : ''}`} 
          title="Cambiar Mapa Base"
        >
          <Globe size={24} />
        </button>

        {/* Botón Toggle 2D/3D */}
        <button 
          onClick={() => setIs3DMode(!is3DMode)} 
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${is3DMode ? 'bg-purple-600 shadow-inner' : 'text-gray-400'}`} 
          title="Cambiar vista a 3D (Globo Terráqueo)"
        >
          <Box size={24} />
        </button>

        {activeTool === 'Basemap' && (
          <div className="absolute left-16 top-auto bg-white p-4 rounded-r-lg shadow-xl border border-gray-200 ml-1 w-64 text-gray-800">
            <h3 className="font-bold text-sm mb-3 text-gray-700 uppercase tracking-wider">Galería de Mapas Base</h3>
            <div className="space-y-2">
              {BASEMAPS.map((basemap) => (
                <button
                  key={basemap.id}
                  onClick={() => changeBasemap(basemap.id)}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm transition ${activeBasemapId === basemap.id ? 'bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200' : 'hover:bg-gray-100 border border-transparent'}`}
                >
                  {basemap.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DEL MAPA */}
      <div className="flex-1 relative bg-gray-100">
        <div ref={mapElement} className="absolute inset-0" />
        
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg z-10 border border-gray-200">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Web GIS</h1>
          <p className="text-sm text-gray-500 font-medium">Mapeo Geológico</p>
          {is3DMode && (
            <div className="mt-2 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
              MODO 3D ACTIVO
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsLayerListOpen(!isLayerListOpen)}
          className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-50 border border-gray-200 text-gray-700"
          title="Gestor de Capas"
        >
          <Layers size={24} />
        </button>
      </div>

      {/* PANEL DE GESTIÓN DE CAPAS (Flotante y Movible) */}
      <DraggableWidget 
        title="Capas del mapa" 
        isOpen={isLayerListOpen} 
        onClose={() => setIsLayerListOpen(false)}
        defaultPosition={{ x: window.innerWidth > 400 ? window.innerWidth - 380 : 16, y: 16 }}
      >
        <div className="flex-1 overflow-y-auto bg-white min-h-[100px] h-full custom-scrollbar" onClick={() => setActiveMenuId(null)}>
          {renderUserLayerTree(layersList, 0)}
        </div>
      </DraggableWidget>
    </div>
  );
};

export default MapComponent;
