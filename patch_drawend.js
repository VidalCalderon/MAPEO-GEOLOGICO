const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

const drawCode = `drawRef.current = new Draw({
        source: source,
        type: activeTool,
      });

      drawRef.current.on('drawend', (e) => {
        const feature = e.feature;
        setTimeout(() => {
           source.removeFeature(feature);
           setPendingFeature({ feature, type: activeTool });
        }, 10);
      });`;

code = code.replace(/drawRef\.current = new Draw\(\{\s*source: source,\s*type: activeTool,\s*\}\);/, drawCode);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
