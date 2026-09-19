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
import { PenTool, MousePointer2, Hexagon, Minus, MapPin } from 'lucide-react';

type Tool = 'Polygon' | 'LineString' | 'Point' | 'Modify' | null;

const MapComponent: React.FC = () => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const sourceRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const snapRef = useRef<Snap | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>(null);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    // Capa donde se guardarán los dibujos vectoriales
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

    // Inicializar el mapa de OpenLayers
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(), // Capa base (satélite o topográfico en el futuro)
        }),
        vectorLayer, // Capa de dibujo encima
      ],
      view: new View({
        center: fromLonLat([-75.0, -10.0]), // Centrado en Perú/Sudamérica como ejemplo
        zoom: 5,
      }),
    });

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Efecto para manejar el cambio de herramienta y el OSNAP
  useEffect(() => {
    const map = mapRef.current;
    const source = sourceRef.current;
    if (!map || !source) return;

    // 1. Limpiar interacciones anteriores
    if (drawRef.current) map.removeInteraction(drawRef.current);
    if (modifyRef.current) map.removeInteraction(modifyRef.current);
    if (snapRef.current) map.removeInteraction(snapRef.current);

    // 2. Añadir la interacción principal (Dibujar o Modificar)
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

    // 3. Añadir SIEMPRE la interacción Snap (OSNAP) al final
    // Esto asegura que al dibujar o modificar, se haga "imán" con los vértices existentes
    if (activeTool) {
      snapRef.current = new Snap({ source: source });
      map.addInteraction(snapRef.current);
    }
  }, [activeTool]);

  return (
    <div className="w-full h-screen relative flex bg-gray-100">
      {/* Barra de herramientas lateral izquierda (Estilo ArcGIS Pro) */}
      <div className="w-16 bg-[#2b2b2b] text-white flex flex-col items-center py-4 gap-4 z-10 shadow-2xl border-r border-gray-700">
        <button
          onClick={() => setActiveTool(null)}
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === null ? 'bg-blue-600 shadow-inner' : ''}`}
          title="Navegar (Mover el mapa)"
        >
          <MousePointer2 size={24} />
        </button>
        <button
          onClick={() => setActiveTool('Polygon')}
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Polygon' ? 'bg-blue-600 shadow-inner' : ''}`}
          title="Dibujar Polígono (Unidad Geológica)"
        >
          <Hexagon size={24} />
        </button>
        <button
          onClick={() => setActiveTool('LineString')}
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'LineString' ? 'bg-blue-600 shadow-inner' : ''}`}
          title="Dibujar Línea (Falla, Contacto Geológico)"
        >
          <Minus size={24} />
        </button>
        <button
          onClick={() => setActiveTool('Point')}
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Point' ? 'bg-blue-600 shadow-inner' : ''}`}
          title="Añadir Punto (Estación de Muestreo, Rumbo/Buzamiento)"
        >
          <MapPin size={24} />
        </button>
        
        <div className="w-10 h-px bg-gray-600 my-2"></div>
        
        <button
          onClick={() => setActiveTool('Modify')}
          className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTool === 'Modify' ? 'bg-green-600 shadow-inner' : ''}`}
          title="Modificar (Editar vértices existentes)"
        >
          <PenTool size={24} />
        </button>
      </div>

      {/* Área Principal del Mapa */}
      <div className="flex-1 relative">
        <div ref={mapElement} className="absolute inset-0" />
        
        {/* Banner de estado superior */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg z-10 border border-gray-200">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Web GIS</h1>
          <p className="text-sm text-gray-500 font-medium">Mapeo Geológico</p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Herramienta</span>
            <span className={`text-sm font-semibold px-2 py-1 rounded-md ${activeTool ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {activeTool || 'Navegación'}
            </span>
          </div>
          {activeTool && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              OSNAP (Snapping) Activado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
