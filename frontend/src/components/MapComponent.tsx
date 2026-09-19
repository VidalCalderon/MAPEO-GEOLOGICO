import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { fromLonLat } from 'ol/proj';
import { PenTool, MousePointer2, Hexagon, Minus, MapPin, Layers, Eye, EyeOff } from 'lucide-react';
import BaseLayer from 'ol/layer/Base';

type Tool = 'Polygon' | 'LineString' | 'Point' | 'Modify' | null;

// Interfaz para nuestro estado local de las capas
interface LayerItem {
  id: string;
  title: string;
  layer: BaseLayer;
  visible: boolean;
  opacity: number;
}

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const sourceRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const snapRef = useRef<Snap | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [layersList, setLayersList] = useState<LayerItem[]>([]);
  const [isLayerListOpen, setIsLayerListOpen] = useState(true);

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
    });
    // Etiqueta personalizada para poder leerla en la UI
    vectorLayer.set('title', 'Capa de Dibujos Geológicos');

    const baseLayer = new TileLayer({
      source: new OSM(),
    });
    baseLayer.set('title', 'Mapa Base (OSM)');

    const map = new Map({
      target: mapElement.current,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: fromLonLat([-75.0, -10.0]),
        zoom: 5,
      }),
    });

    mapRef.current = map;

    // Inicializar el estado de la lista de capas
    const initialLayers = map.getLayers().getArray().map((layer, index) => ({
      id: `layer-${index}`,
      title: layer.get('title') || `Capa ${index + 1}`,
      layer: layer,
      visible: layer.getVisible(),
      opacity: layer.getOpacity() * 100,
    }));
    // Invertir para que la capa superior salga primero en la lista
    setLayersList(initialLayers.reverse());

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

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
    } else if (activeTool) {
      drawRef.current = new Draw({
        source: source,
        type: activeTool,
      });
      map.addInteraction(drawRef.current);
    }

    if (activeTool) {
      snapRef.current = new Snap({ source: source });
      map.addInteraction(snapRef.current);
    }
  }, [activeTool]);

  // Funciones para controlar las capas desde la UI
  const toggleLayerVisibility = (id: string) => {
    setLayersList(prevList => prevList.map(item => {
      if (item.id === id) {
        const newVisible = !item.visible;
        item.layer.setVisible(newVisible);
        return { ...item, visible: newVisible };
      }
      return item;
    }));
  };

  const handleOpacityChange = (id: string, newOpacity: number) => {
    setLayersList(prevList => prevList.map(item => {
      if (item.id === id) {
        item.layer.setOpacity(newOpacity / 100);
        return { ...item, opacity: newOpacity };
      }
      return item;
    }));
  };

  return (
    <div className="w-full h-full relative flex overflow-hidden">
      {/* BARRA LATERAL IZQUIERDA (Herramientas de dibujo) */}
      <div className="w-16 bg-[#2b2b2b] text-white flex flex-col items-center py-4 gap-4 z-10 shadow-2xl border-r border-gray-700">
        <button onClick={() => setActiveTool(null)} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === null ? 'bg-blue-600 shadow-inner' : ''}`} title="Navegar">
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
        <div className="w-10 h-px bg-gray-600 my-2"></div>
        <button onClick={() => setActiveTool('Modify')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Modify' ? 'bg-green-600 shadow-inner' : ''}`} title="Modificar vértices">
          <PenTool size={24} />
        </button>
      </div>

      {/* ÁREA DEL MAPA */}
      <div className="flex-1 relative bg-gray-100">
        <div ref={mapElement} className="absolute inset-0" />
        
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg z-10 border border-gray-200">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Web GIS</h1>
          <p className="text-sm text-gray-500 font-medium">Mapeo Geológico</p>
        </div>

        {/* Botón flotante para abrir/cerrar panel de capas en el visor */}
        <button 
          onClick={() => setIsLayerListOpen(!isLayerListOpen)}
          className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-50 border border-gray-200 text-gray-700"
          title="Gestor de Capas"
        >
          <Layers size={24} />
        </button>
      </div>

      {/* PANEL DE GESTIÓN DE CAPAS (Derecha) */}
      {isLayerListOpen && (
        <div className="w-80 bg-white shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.1)] z-10 flex flex-col border-l border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              Contenido del Mapa
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {layersList.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 text-sm truncate pr-2" title={item.title}>
                    {item.title}
                  </span>
                  <button 
                    onClick={() => toggleLayerVisibility(item.id)}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {item.visible ? <Eye size={18} /> : <EyeOff size={18} className="text-gray-300" />}
                  </button>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Transparencia</span>
                    <span>{100 - item.opacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={item.opacity}
                    onChange={(e) => handleOpacityChange(item.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            ))}
            {layersList.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No hay capas cargadas.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
