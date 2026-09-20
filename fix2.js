const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');
code = code.replace(/loadSavedLayers\(map\);\s*\/\/ Actualizar lista/g, 'loadSavedLayers(map);\n    loadServerDrawings();\n\n    // Actualizar lista');
fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
