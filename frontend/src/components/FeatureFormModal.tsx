import React, { useState } from 'react';
import { X } from 'lucide-react';
import Feature from 'ol/Feature';
import { POLYGON_RULES } from '../utils/formRules';

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
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
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
    </div>
  );
};

export default FeatureFormModal;
