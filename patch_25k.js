const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

const regex = /<button onClick=\{handleAddGroup\} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">\s*\+ Grupo\s*<\/button>/;

c = c.replace(
  regex,
  `<div className="flex gap-2">
     <button onClick={() => {
        const rootId = Math.random().toString(36).substr(2, 9);
        const newLayers = [
          ...adminLayers,
          { id: rootId, type: 'group', title: 'Mapeo Geológico 25K', parentId: null, expanded: true, enabled: true },
          { id: Math.random().toString(36).substr(2, 9), type: 'group', title: 'Litología 25K', parentId: rootId, expanded: true, enabled: true },
          { id: Math.random().toString(36).substr(2, 9), type: 'group', title: 'Alteración 25K', parentId: rootId, expanded: true, enabled: true },
          { id: Math.random().toString(36).substr(2, 9), type: 'group', title: 'Mineralización 25K', parentId: rootId, expanded: true, enabled: true },
          { id: Math.random().toString(36).substr(2, 9), type: 'group', title: 'Estructuras (Líneas) 25K', parentId: rootId, expanded: true, enabled: true },
          { id: Math.random().toString(36).substr(2, 9), type: 'group', title: 'Estructuras (Puntos) 25K', parentId: rootId, expanded: true, enabled: true }
        ];
        saveLayers(newLayers);
     }} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-1 px-2 rounded transition">
       + Base 25K
     </button>
     <button onClick={handleAddGroup} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">
       + Grupo
     </button>
   </div>`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
