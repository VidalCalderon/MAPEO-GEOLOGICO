const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(
  "const raw = localStorage.getItem('admin_layers') || '[]';",
  `let raw = localStorage.getItem('admin_layers');
    if (!raw || raw === '[]') {
      const defaultLayers = [
        { id: 'grp-lito', type: 'group', title: 'Litología', parentId: null, expanded: true, enabled: true },
        { id: 'grp-alt', type: 'group', title: 'Alteración', parentId: null, expanded: true, enabled: true },
        { id: 'grp-min', type: 'group', title: 'Mineralización', parentId: null, expanded: true, enabled: true },
        { id: 'grp-est-lin', type: 'group', title: 'Estructuras (Líneas)', parentId: null, expanded: true, enabled: true },
        { id: 'grp-est-pt', type: 'group', title: 'Estructuras (Puntos)', parentId: null, expanded: true, enabled: true }
      ];
      raw = JSON.stringify(defaultLayers);
      localStorage.setItem('admin_layers', raw);
    }`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
