const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(
  /drawRef\.current = new Draw\(\{[\s\S]*?freehand: activeTool === "FreehandPolygon",\s*\}\);/,
  `drawRef.current = new Draw({
        source: source,
        type: activeTool === "FreehandPolygon" ? "Polygon" : activeTool,
        freehand: activeTool === "FreehandPolygon",
        trace: activeTool === "Polygon" || activeTool === "LineString",
        traceSource: source,
      });`
);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
