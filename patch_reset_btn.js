const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(
  '<button onClick={handleAddGroup} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">\n                + Grupo\n              </button>',
  `<button onClick={() => {
                const defaultLayers = [
                  { id: 'grp-lito', type: 'group', title: 'Litología', parentId: null, expanded: true, enabled: true },
                  { id: 'grp-alt', type: 'group', title: 'Alteración', parentId: null, expanded: true, enabled: true },
                  { id: 'grp-min', type: 'group', title: 'Mineralización', parentId: null, expanded: true, enabled: true },
                  { id: 'grp-est-lin', type: 'group', title: 'Estructuras (Líneas)', parentId: null, expanded: true, enabled: true },
                  { id: 'grp-est-pt', type: 'group', title: 'Estructuras (Puntos)', parentId: null, expanded: true, enabled: true }
                ];
                localStorage.setItem('admin_layers', JSON.stringify(defaultLayers));
                window.location.reload();
              }} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-1 px-2 rounded transition mr-2">
                Restaurar Grupos Base
              </button>
              <button onClick={handleAddGroup} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">
                + Grupo
              </button>`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
