const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

// 1. Modificar getAvailableLayers para que solo traiga parentId === null
const getLayersRegex = /return parsed\.filter\(\(l: any\) => l\.type === 'group'\);/;
c = c.replace(
  getLayersRegex,
  `return parsed.filter((l: any) => l.type === 'group' && !l.parentId);` // parentId nulo o indefinido
);

// 2. Cambiar targetLayerId a activeWorkspace y usar localStorage
const stateRegex = /const \[targetLayerId, setTargetLayerId\] = useState\(''\);/;
c = c.replace(
  stateRegex,
  `const [activeWorkspace, setActiveWorkspace] = useState(localStorage.getItem('active_workspace') || '');`
);

// 3. Modificar el selector en el render (buscar dónde está y moverlo)
// Vamos a reemplazar el bloque entero del div bg-blue-50
const selectBlockRegex = /\{availableLayers\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/;

const newSelectBlock = `{availableLayers.length > 0 && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <label className="block text-sm font-bold text-indigo-900 mb-1">Proyecto / Escala de Trabajo</label>
              <select 
                value={activeWorkspace} 
                onChange={e => {
                  setActiveWorkspace(e.target.value);
                  localStorage.setItem('active_workspace', e.target.value);
                }}
                className="w-full border border-indigo-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-indigo-800"
              >
                <option value="">-- Seleccione Proyecto/Escala --</option>
                {availableLayers.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
              <p className="text-[10px] text-indigo-600 mt-1">Se recordará esta elección en tus próximos dibujos.</p>
            </div>
          )}`;

c = c.replace(selectBlockRegex, newSelectBlock);

// 4. Cambiar el guardado para usar activeWorkspace
const saveRegex = /onSave\(\{ \.\.\.formData, TARGET_LAYER: targetLayerId \}\);/;
c = c.replace(
  saveRegex,
  `onSave({ ...formData, WORKSPACE_ID: activeWorkspace });`
);

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
