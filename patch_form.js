const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

// 1. Añadir capa de destino leyendo admin_layers
const importsRegex = /import \{ POLYGON_RULES \} from '\.\.\/utils\/formRules';/;
c = c.replace(
  importsRegex,
  `import { POLYGON_RULES } from '../utils/formRules';

function getAvailableLayers() {
  try {
    const raw = localStorage.getItem('admin_layers');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Solo tomamos grupos (que el usuario usa como capas lógicas en su árbol)
      return parsed.filter((l: any) => l.type === 'group');
    }
  } catch (e) {}
  return [];
}`
);

// 2. Estado para posición, drag y capa seleccionada
const stateRegex = /const \[errors, setErrors\] = useState<Record<string, string>>\(\{\}\);/;
c = c.replace(
  stateRegex,
  `const [errors, setErrors] = useState<Record<string, string>>({});
  const [targetLayerId, setTargetLayerId] = useState('');
  const availableLayers = getAvailableLayers();

  // Para arrastrar el modal
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
  };`
);

// 3. Cambiar handleSave para guardar el targetLayerId
const saveRegex = /onSave\(\{ \.\.\.formData \}\);/;
c = c.replace(
  saveRegex,
  `onSave({ ...formData, TARGET_LAYER: targetLayerId });`
);

// 4. Cambiar el contenedor para que sea flotante y draggable
const wrapperRegex = /<div className="fixed inset-0 bg-black\/50 z-\[9999\] flex items-center justify-center p-4">\s*<div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-\[90vh\]">/;
c = c.replace(
  wrapperRegex,
  `<div 
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-300"
      style={{ left: position.x, top: position.y, width: '500px', maxHeight: '90vh' }}
    >`
);

// Eliminar el div de cierre extra
c = c.replace(/<\/div>\s*<\/div>\s*\);\s*\};\s*export default FeatureFormModal;/, `</div>\n  );\n};\n\nexport default FeatureFormModal;`);

// 5. Agregar cursor-move al header y eventos de puntero
const headerRegex = /<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">/;
c = c.replace(
  headerRegex,
  `<div 
        className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-lg cursor-move select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >`
);

// 6. Agregar selector de capa destino al principio del body
const bodyRegex = /{geometryType === 'Polygon' && \(/;
c = c.replace(
  bodyRegex,
  `{availableLayers.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-bold text-blue-900 mb-1">Capa Destino (Ej: Litología 25K)</label>
              <select 
                value={targetLayerId} 
                onChange={e => setTargetLayerId(e.target.value)}
                className="w-full border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Seleccione a qué capa pertenece...</option>
                {availableLayers.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
          
          {geometryType === 'Polygon' && (`
);

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
