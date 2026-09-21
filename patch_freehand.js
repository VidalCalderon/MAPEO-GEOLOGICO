const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

// 1. Añadir FreehandPolygon a Tool
c = c.replace(
  /type Tool = "Polygon" \| "LineString" \| "Point" \| "Modify" \| "Select" \| "Basemap" \| "AddLayer" \| null;/,
  `type Tool = "Polygon" | "LineString" | "Point" | "Modify" | "Select" | "FreehandPolygon" | "Basemap" | "AddLayer" | null;`
);

// 2. Añadir state para la tolerancia
c = c.replace(
  /const \[activeTool, setActiveTool\] = useState<Tool>\(null\);/,
  `const [activeTool, setActiveTool] = useState<Tool>(null);\n  const [freehandTolerance, setFreehandTolerance] = useState(5);`
);

// 3. Reemplazar la lógica de creación del Draw
const drawLogicRegex = /\} else if \(\s*activeTool &&\s*activeTool !== "Basemap" &&\s*activeTool !== "AddLayer"\s*\) \{[\s\S]*?map\.addInteraction\(drawRef\.current\);\s*\}/;

const newDrawLogic = `} else if (
      activeTool === "Polygon" ||
      activeTool === "LineString" ||
      activeTool === "Point" ||
      activeTool === "FreehandPolygon"
    ) {
      drawRef.current = new Draw({
        source: source,
        type: activeTool === "FreehandPolygon" ? "Polygon" : activeTool,
        freehand: activeTool === "FreehandPolygon",
      });

      drawRef.current.on("drawend", (e) => {
        const feature = e.feature;
        
        if (activeTool === "FreehandPolygon") {
          const geom = feature.getGeometry();
          if (geom) {
            feature.setGeometry(geom.simplify(freehandTolerance));
          }
        }
        
        setTimeout(() => {
          source.removeFeature(feature);
          setPendingFeature({ feature, type: activeTool === "FreehandPolygon" ? "Polygon" : activeTool });
        }, 10);
      });
      map.addInteraction(drawRef.current);
    }`;

c = c.replace(drawLogicRegex, newDrawLogic);

// 4. Modificar el snap logic para FreehandPolygon
const snapLogicRegex = /if \(activeTool && activeTool !== "Basemap" && activeTool !== "AddLayer"\) \{\s*snapRef\.current = new Snap\(\{ source: source \}\);\s*map\.addInteraction\(snapRef\.current\);\s*\}/;
const newSnapLogic = `if (activeTool === "Polygon" || activeTool === "LineString" || activeTool === "Point" || activeTool === "FreehandPolygon") {
      snapRef.current = new Snap({ source: source });
      map.addInteraction(snapRef.current);
    }`;
c = c.replace(snapLogicRegex, newSnapLogic);

// 5. Añadir el botón en el menú de Tools
const menuButtonsRegex = /<button onClick=\{\(\) => setActiveTool\("Polygon"\)\}/;
c = c.replace(
  menuButtonsRegex,
  `<button onClick={() => {
                  const tolStr = prompt("Distancia en metros entre puntos (ej. 5):", "5");
                  if (tolStr !== null) {
                    const tol = parseFloat(tolStr);
                    setFreehandTolerance(isNaN(tol) ? 5 : tol);
                    setActiveTool("FreehandPolygon");
                  }
                }} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><PenTool size={16} /> Freehand Polygon</button>\n                <button onClick={() => setActiveTool("Polygon")}`
);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
