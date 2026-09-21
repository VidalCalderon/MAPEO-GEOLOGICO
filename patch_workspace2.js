const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

// 1. Modificar inicialización del workspace para que si hay 1 solo asigne ese
const stateRegex = /const \[activeWorkspace, setActiveWorkspace\] = useState\(localStorage\.getItem\('active_workspace'\) \|\| ''\);/;
c = c.replace(
  stateRegex,
  `const defaultWorkspace = availableLayers.length === 1 ? availableLayers[0].id : (localStorage.getItem('active_workspace') || '');
  const [activeWorkspace, setActiveWorkspace] = useState(defaultWorkspace);`
);

// 2. Modificar el bloque de renderizado del selector
// Actualmente el bloque comienza con {availableLayers.length > 0 && (
// y termina antes de {geometryType === 'Polygon' && (
const selectBlockRegex = /\{availableLayers\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/;

const newSelectBlock = `{availableLayers.length > 1 && (
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
          )}`;

c = c.replace(selectBlockRegex, newSelectBlock);

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
