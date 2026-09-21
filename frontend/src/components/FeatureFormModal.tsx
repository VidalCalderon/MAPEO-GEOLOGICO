import React, { useState } from 'react';
import { X } from 'lucide-react';
import Feature from 'ol/Feature';
import { POLYGON_RULES } from '../utils/formRules';

function getAvailableLayers() {
  try {
    const raw = localStorage.getItem('admin_layers');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Solo tomamos grupos (que el usuario usa como capas lógicas en su árbol)
      return parsed.filter((l: any) => l.type === 'group' && !l.parentId);
    }
  } catch (e) {}
  return [];
}

interface FeatureFormModalProps {
  feature: Feature | null;
  geometryType: string;
  onSave: (properties: any) => void;
  onCancel: () => void;
}

// Dominios fijos para Puntos y Líneas
const STATIC_DOMAINS = {
  Puntos_TIPO: ['Falla', 'Venillas', 'Veta (>10cm)', 'Ledge', 'Estrato', 'Fractura', 'Foliación', 'Flow Banding', 'Dique', 'Dextral', 'Sinestral', 'Anticlinal', 'Sinclinal', 'Anticlinal Tumbado', 'Sinclinal Tumbado', 'Buzamiento Invertido', 'Brecha'],
  Lineas_TIPO: ['Falla', 'Venillas', 'Veta (>10cm)', 'Ledge', 'Sobreescurrimiento', 'Zona de Falla', 'Zona de Fracturamiento', 'Anticlinal', 'Sinclinal', 'Discordancia', 'Esquistosidad', 'Laminación', 'Escape de Fluidos'],
  Lineas_SUBTIPO: ['Venillas (<10cm)', 'Venilla A', 'Venilla B', 'Venilla C', 'Venilla D', 'Venilla EB', 'Venilla EDM', 'Venilla M', 'Stockwork', 'Craquelamiento', 'Diaclasas', 'Fracturas', 'Zona de Cizalla'],
  Lineas_TEXTURA: ['Brechada', 'Shear Zone', 'Masiva', 'Bitumen', 'Bandeada', 'Crustiforme', 'Ebullición', 'Coloforme', 'Indiferenciado', 'Stockwork', 'Foliada', 'Planar', 'Cruzada']
};

const FeatureFormModal: React.FC<FeatureFormModalProps> = ({ feature, geometryType, onSave, onCancel }) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const availableLayers = getAvailableLayers();
  const defaultWorkspace = availableLayers.length === 1 ? availableLayers[0].id : (localStorage.getItem('active_workspace') || '');
  const [activeWorkspace, setActiveWorkspace] = useState(defaultWorkspace);

  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = React.useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({ x: dragRef.current.initialX + (e.clientX - dragRef.current.startX), y: dragRef.current.initialY + (e.clientY - dragRef.current.startY) });
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
  
  // Categoría principal para Polígonos
  const [polygonCategory, setPolygonCategory] = useState<'Litologia' | 'Alteracion' | 'Mineralizacion'>('Litologia');

  if (!feature) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el TIPO principal en un polígono, limpiamos los sub-campos
    if (name === 'TIPO' && geometryType === 'Polygon') {
      setFormData({ TIPO: value }); // Resetear el resto
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Validadores en vivo
    const newErrors = { ...errors };
    if (name === 'DIP_DIR') {
      const num = parseFloat(value);
      if (num < 0 || num > 360) newErrors[name] = 'Debe estar entre 0 y 360';
      else delete newErrors[name];
    }
    if (name === 'DIP') {
      const num = parseFloat(value);
      if (num < 0 || num > 90) newErrors[name] = 'Debe estar entre 0 y 90';
      else delete newErrors[name];
    }
    setErrors(newErrors);
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      alert("Por favor corrige los errores antes de guardar.");
      return;
    }
    
    const finalData = { ...formData, Categoria: geometryType === 'Polygon' ? polygonCategory : geometryType };
    onSave(finalData);
  };

  // Obtener las reglas dinámicas para el polígono seleccionado
  const dynamicRules = geometryType === 'Polygon' && formData.TIPO && POLYGON_RULES[polygonCategory]
    ? POLYGON_RULES[polygonCategory][formData.TIPO] 
    : {};

  return (
    <div 
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-300"
      style={{ left: position.x, top: position.y, width: '500px', maxHeight: '90vh' }}
    >
        
        {/* HEADER */}
        <div 
        className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-lg cursor-move select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
          <h2 className="text-xl font-bold text-gray-800">
            {geometryType === 'Point' ? 'Estructura (Punto)' : 
             geometryType === 'LineString' ? 'Estructura (Línea)' : 
             'Nueva Área Geológica'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {availableLayers.length > 1 && (
            <div className="mb-3 p-2 bg-indigo-50/50 border border-indigo-100 rounded flex items-center gap-3">
              <div className="shrink-0">
                <label className="block text-xs font-bold text-indigo-900">Proyecto / Escala</label>
              </div>
              <select 
                value={activeWorkspace} 
                onChange={e => {
                  setActiveWorkspace(e.target.value);
                  localStorage.setItem('active_workspace', e.target.value);
                }}
                className="flex-1 text-xs border border-indigo-200 rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none font-semibold text-indigo-800 bg-white"
              >
                <option value="">-- Seleccione --</option>
                {availableLayers.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
          
          {geometryType === 'Polygon' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Capa</label>
              <select 
                value={polygonCategory} 
                onChange={(e: any) => {
                  setPolygonCategory(e.target.value);
                  setFormData({}); // Limpiar datos al cambiar de categoría
                }}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Litologia">Litología</option>
                <option value="Alteracion">Alteración</option>
                <option value="Mineralizacion">Mineralización</option>
              </select>
            </div>
          )}

          {/* CAMPOS PARA PUNTOS */}
          {geometryType === 'Point' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">TIPO *</label>
                <select name="TIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="">Seleccione...</option>
                  {STATIC_DOMAINS.Puntos_TIPO.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">DIP_DIR (0-360)</label>
                  <input type="number" name="DIP_DIR" onChange={handleChange} className={`w-full border ${errors.DIP_DIR ? 'border-red-500' : 'border-gray-300'} rounded p-2`} />
                  {errors.DIP_DIR && <p className="text-red-500 text-xs mt-1">{errors.DIP_DIR}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">DIP (0-90)</label>
                  <input type="number" name="DIP" onChange={handleChange} className={`w-full border ${errors.DIP ? 'border-red-500' : 'border-gray-300'} rounded p-2`} />
                  {errors.DIP && <p className="text-red-500 text-xs mt-1">{errors.DIP}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ANCHO (m)</label>
                <input type="number" step="0.01" name="ANCHO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
            </>
          )}

          {/* CAMPOS PARA LÍNEAS */}
          {geometryType === 'LineString' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">TIPO *</label>
                  <select name="TIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2">
                    <option value="">Seleccione...</option>
                    {STATIC_DOMAINS.Lineas_TIPO.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SUBTIPO</label>
                  <select name="SUBTIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2">
                    <option value="">Seleccione...</option>
                    {STATIC_DOMAINS.Lineas_SUBTIPO.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">TEXTURA</label>
                <select name="TEXTURA" onChange={handleChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="">Seleccione...</option>
                  {STATIC_DOMAINS.Lineas_TEXTURA.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
            </>
          )}

          {/* CAMPOS PARA POLÍGONOS DINÁMICOS */}
          {geometryType === 'Polygon' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">TIPO DE ROCA / ALTERACIÓN</label>
                <select name="TIPO" value={formData.TIPO || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="">Seleccione...</option>
                  {Object.keys(POLYGON_RULES[polygonCategory] || {}).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* RENDERIZADO DINÁMICO DE SUB-CAMPOS */}
              {dynamicRules && Object.keys(dynamicRules).length > 0 && (
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                  {Object.entries(dynamicRules).map(([field, options]) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{field}</label>
                      <select name={field} onChange={handleChange} className="w-full border border-gray-300 rounded p-2">
                        <option value="">Seleccione...</option>
                        {(options as string[]).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CAMPOS COMUNES (SIEMPRE VISIBLES) */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">DESCRIPCIÓN</label>
            <textarea name="DESCRIPCION" rows={3} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" placeholder="Notas de campo..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">GEÓLOGO</label>
            <input type="text" name="GEOLOGO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2" placeholder="Ej: J. Perez" />
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium">
            Cancelar (Borrar)
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 font-bold">
            Validar y Guardar
          </button>
        </div>
      </div>
  );
};

export default FeatureFormModal;
