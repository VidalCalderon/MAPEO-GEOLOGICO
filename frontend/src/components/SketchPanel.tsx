import React, { useState } from 'react';
import { 
  MousePointer2, MapPin, Share2, Hexagon, Square, Circle, 
  Pencil, Type, Trash2, Settings, X, 
  Palette
} from 'lucide-react';

interface SketchPanelProps {
  onClose: () => void;
  activeSketchTool: string | null;
  setActiveSketchTool: (tool: string | null) => void;
  sketchColor: string;
  setSketchColor: (color: string) => void;
  sketchOpacity: number;
  setSketchOpacity: (opacity: number) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  showMeasurements: boolean;
  setShowMeasurements: (show: boolean) => void;
  onClearAll: () => void;
}

const PRESET_COLORS = [
  '#4a90e2', '#d0021b', '#7ed321', '#9013fe', '#50e3c2', '#f5a623',
  '#8b572a', '#417505', '#bd10e0', '#4a4a4a', '#000000', '#ffffff'
];

const SketchPanel: React.FC<SketchPanelProps> = ({
  onClose,
  activeSketchTool,
  setActiveSketchTool,
  sketchColor,
  setSketchColor,
  sketchOpacity,
  setSketchOpacity,
  strokeWidth,
  setStrokeWidth,
  showMeasurements,
  setShowMeasurements,
  onClearAll
}) => {
  const [showSettings, setShowSettings] = useState(true);

  const tools = [
    { id: 'Select', icon: <MousePointer2 size={16} />, title: 'Seleccionar' },
    { id: 'Point', icon: <MapPin size={16} />, title: 'Punto' },
    { id: 'LineString', icon: <Share2 size={16} className="rotate-90" />, title: 'Línea' },
    { id: 'Polygon', icon: <Hexagon size={16} />, title: 'Polígono' },
    { id: 'Rectangle', icon: <Square size={16} />, title: 'Rectángulo' },
    { id: 'Circle', icon: <Circle size={16} />, title: 'Círculo' },
    { id: 'Freehand', icon: <Pencil size={16} />, title: 'Mano alzada' },
    { id: 'Text', icon: <Type size={16} />, title: 'Texto' },
  ];

  return (
    <div className="absolute top-20 right-4 w-[340px] bg-white rounded shadow-xl flex flex-col z-[2000] border border-gray-300 pointer-events-auto">
      {/* Header */}
      <div className="bg-[#0b1f15] text-white px-3 py-2 flex justify-between items-center rounded-t cursor-move">
        <h3 className="font-semibold text-sm">Dibujar</h3>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[80vh]">
        {/* Tools */}
        <p className="text-xs text-gray-600 mb-2">Seleccionar modo de dibujo</p>
        <div className="flex flex-wrap gap-1 mb-4 pb-4 border-b border-gray-100">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveSketchTool(t.id)}
              className={`p-1.5 rounded transition ${activeSketchTool === t.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title={t.title}
            >
              {t.icon}
            </button>
          ))}
          
          <div className="w-px bg-gray-300 mx-1 h-6 self-center"></div>
          
          <button onClick={onClearAll} className="p-1.5 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 transition" title="Borrar todo">
            <Trash2 size={16} />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-1.5 rounded transition ${showSettings ? 'bg-gray-200' : 'text-gray-600 hover:bg-gray-100'}`} title="Ajustes de estilo">
            <Settings size={16} />
          </button>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-600 mb-2 flex items-center gap-1"><Palette size={14} /> Color y Previsualización</p>
              <div className="flex gap-2 p-3 bg-gray-50 border border-gray-200 rounded">
                <div 
                  className="w-10 h-10 border-2" 
                  style={{ 
                    backgroundColor: `${sketchColor}${Math.round((100 - sketchOpacity) * 255 / 100).toString(16).padStart(2, '0')}`,
                    borderColor: strokeWidth > 0 ? sketchColor : 'transparent',
                    borderWidth: `${strokeWidth}px`
                  }}
                ></div>
                <div className="flex-1 grid grid-cols-6 gap-1">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setSketchColor(c)}
                      className={`w-6 h-6 border ${sketchColor === c ? 'ring-2 ring-black border-white' : 'border-gray-300'} rounded-sm transition`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-600">Transparencia de relleno</p>
                <span className="text-xs font-mono">{sketchOpacity}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={sketchOpacity} 
                onChange={e => setSketchOpacity(Number(e.target.value))}
                className="w-full accent-black"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-600">Grosor de borde</p>
                <input 
                  type="number" 
                  min="0" max="10" 
                  value={strokeWidth} 
                  onChange={e => setStrokeWidth(Number(e.target.value))}
                  className="w-16 p-1 text-xs border rounded text-right"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-600">Mostrar mediciones (Área/Perímetro)</span>
                <input 
                  type="checkbox" 
                  checked={showMeasurements} 
                  onChange={e => setShowMeasurements(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SketchPanel;
