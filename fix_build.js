const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

code = code.replace(/Navigation, /g, '').replace(/Settings, /g, '').replace(/Crosshair, /g, '').replace(/ZoomIn, /g, '').replace(/Eye, /g, '').replace(/Folder, /g, '').replace(/FolderOpen, /g, '').replace(/MoreVertical, /g, '');
code = code.replace(/const \[addLayerTab, setAddLayerTab\] = useState\<'search' \| 'url'\>\('url'\);\s*/, '');
code = code.replace(/\/\/ NUEVO ESTADO PARA ERRORES GLOBALES\s*const \[debugError, setDebugError\] = useState\<string\>\('Sin errores'\);\s*const \[debugCounts, setDebugCounts\] = useState\<\{user: number, admin: number\}\>\(\{user: 0, admin: 0\}\);\s*const \[debugInner, setDebugInner\] = useState\<string\>\('Not run'\);\s*/, '');
code = code.replace(/const debugAdminLayers = async \(map: Map\) => \{[\s\S]*?console\.log\('Admin layers currently in map:', adminLayers\);\s*\};\s*/, '');
code = code.replace(/\(child, id\) =>/g, '(child) =>');
code = code.replace(/const removeCustomLayer = \(id: string, layer: BaseLayer\) => \{/g, 'const removeCustomLayer = (_id: string, layer: BaseLayer) => {');
code = code.replace(/const \[debugAdminLayers, setDebugAdminLayers\] = useState\('...'\);\s*useEffect\(\(\) => \{\s*setDebugAdminLayers\(localStorage\.getItem\('admin_layers'\) \|\| 'VACIO'\);\s*\}, \[\]\);\s*/, '');

fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
