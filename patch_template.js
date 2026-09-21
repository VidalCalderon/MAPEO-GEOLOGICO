const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// 1. Quitar el botón + Base 25K
const base25kRegex = /<div className="flex gap-2">[\s\S]*?<button onClick=\{handleAddGroup\} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">\s*\+ Grupo\s*<\/button>\s*<\/div>/;
c = c.replace(
  base25kRegex,
  `<button onClick={handleAddGroup} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">+ Grupo</button>`
);

// 2. Agregar 'template' a addMode
c = c.replace(
  /const \[addMode, setAddMode\] = useState<'url' \| 'file'>\('url'\);/,
  `const [addMode, setAddMode] = useState<'url' | 'file' | 'template'>('url');`
);

// 3. Modificar los botones de addMode
const addModeButtonsRegex = /<div className="flex border border-gray-300 rounded overflow-hidden">\s*<button onClick=\{\(\) => setAddMode\('url'\)\}[\s\S]*?<\/button>\s*<button onClick=\{\(\) => setAddMode\('file'\)\}[\s\S]*?<\/button>\s*<\/div>/;
c = c.replace(
  addModeButtonsRegex,
  `<div className="flex border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setAddMode('url')} className={\`flex-1 py-1 text-sm font-semibold \${addMode === 'url' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}\`}>URL</button>
                <button onClick={() => setAddMode('file')} className={\`flex-1 py-1 text-sm font-semibold \${addMode === 'file' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}\`}>Archivo</button>
                <button onClick={() => setAddMode('template')} className={\`flex-1 py-1 text-sm font-semibold \${addMode === 'template' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}\`}>Plantilla</button>
              </div>`
);

// 4. Mostrar el select cuando addMode === 'template'
const urlInputRegex = /\{addMode === 'url' \? \([\s\S]*?<\/div>\s*\)\}/;
c = c.replace(
  urlInputRegex,
  `{addMode === 'url' ? (
                <input type="text" placeholder="URL (ej: .../MapServer)" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              ) : addMode === 'file' ? (
                <div>
                  <input type="file" onChange={e => setNewFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Soporta: .shp (en .zip), .geojson, .json, .kml, .kmz, .tif</p>
                </div>
              ) : (
                <select value={newUrl} onChange={e => {
                  setNewUrl(e.target.value);
                  if(!newTitle) setNewTitle(e.target.value);
                }} className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none">
                  <option value="">Seleccione plantilla editable...</option>
                  <option value="Litología">Litología</option>
                  <option value="Alteración">Alteración</option>
                  <option value="Mineralización">Mineralización</option>
                  <option value="Estructuras (Líneas)">Estructuras (Líneas)</option>
                  <option value="Estructuras (Puntos)">Estructuras (Puntos)</option>
                </select>
              )}`
);

// 5. En handleAddLayer, soportar addMode === 'template'
// Buscamos: const newLayer: AdminLayerNode = {
const newLayerRegex = /const newLayer: AdminLayerNode = \{[\s\S]*?\};/;
c = c.replace(
  newLayerRegex,
  `const newLayer: AdminLayerNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: addMode === 'template' ? 'group' : (addMode === 'url' ? 'url' : 'file'),
      title: newTitle || (addMode === 'template' ? newUrl : 'Nueva Capa'),
      url: addMode === 'url' ? newUrl : undefined,
      file: addMode === 'file' && newFile ? newFile : undefined,
      parentId: selectedParentId,
      expanded: true,
      enabled: true
    };`
);

// Eliminar alert que bloquea si addMode === 'url' && !newUrl
const alertRegex = /if \(addMode === 'url' && !newUrl\) \{ alert\('Ingresa una URL'\); return; \}/;
c = c.replace(
  alertRegex,
  `if (addMode === 'url' && !newUrl) { alert('Ingresa una URL'); return; }
    if (addMode === 'template' && !newUrl) { alert('Selecciona una plantilla'); return; }`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
