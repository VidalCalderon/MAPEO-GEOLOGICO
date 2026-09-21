const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

// 1. Imports
if (!c.includes('import Select from "ol/interaction/Select"')) {
  c = c.replace(
    /import Draw from "ol\/interaction\/Draw";/,
    `import Draw from "ol/interaction/Draw";\nimport Select from "ol/interaction/Select";\nimport Translate from "ol/interaction/Translate";`
  );
}

c = c.replace(
  /\} from "lucide-react";/,
  `, MousePointer2, Trash2, Edit } from "lucide-react";`
);

// 2. Type Tool
c = c.replace(
  /type Tool =\s*"Polygon" \| "LineString" \| "Point" \| "Modify" \| "Basemap" \| "AddLayer" \| null;/,
  `type Tool = "Polygon" | "LineString" | "Point" | "Modify" | "Select" | "Basemap" | "AddLayer" | null;`
);

// 3. States & Refs
const refsRegex = /const sourceRef = useRef<VectorSource \| null>\(null\);/;
c = c.replace(
  refsRegex,
  `const sourceRef = useRef<VectorSource | null>(null);\n  const selectRef = useRef<Select | null>(null);\n  const translateRef = useRef<Translate | null>(null);\n  const [contextMenu, setContextMenu] = useState<{x: number, y: number, feature: Feature} | null>(null);`
);

// 4. Map ContextMenu Event
const mapInitRegex = /mapRef\.current = map;/;
c = c.replace(
  mapInitRegex,
  `mapRef.current = map;\n    map.getViewport().addEventListener('contextmenu', (e: any) => {\n      e.preventDefault();\n      const feature = map.forEachFeatureAtPixel(map.getEventPixel(e), f => f);\n      if (feature) {\n        setContextMenu({ x: e.clientX, y: e.clientY, feature: feature as Feature });\n      } else {\n        setContextMenu(null);\n      }\n    });\n    map.getViewport().addEventListener('click', () => setContextMenu(null));`
);

// 5. Interactions
const removeInteractionsRegex = /if \(snapRef\.current\) map\.removeInteraction\(snapRef\.current\);/;
c = c.replace(
  removeInteractionsRegex,
  `if (snapRef.current) map.removeInteraction(snapRef.current);\n    if (selectRef.current) map.removeInteraction(selectRef.current);\n    if (translateRef.current) map.removeInteraction(translateRef.current);`
);

const addInteractionRegex = /if \(activeTool === "Modify"\) \{/;
c = c.replace(
  addInteractionRegex,
  `if (activeTool === "Select") {
      selectRef.current = new Select({ hitTolerance: 5 });
      map.addInteraction(selectRef.current);
      translateRef.current = new Translate({ features: selectRef.current.getFeatures() });
      map.addInteraction(translateRef.current);
    } else if (activeTool === "Modify") {`
);

// 6. Tools Menu Button
const polygonBtnRegex = /<button\s*onClick=\{\(\) => setActiveTool\("Polygon"\)\}/;
c = c.replace(
  polygonBtnRegex,
  `<button onClick={() => setActiveTool("Select")} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><MousePointer2 size={16} /> Select / Move</button>\n                <button onClick={() => setActiveTool("Polygon")}`
);

// 7. Context Menu UI
const contextMenuUI = `
      {contextMenu && (
        <div className="fixed bg-white border border-gray-300 shadow-2xl rounded-lg z-[9999] py-1 flex flex-col min-w-[150px]" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-600">Opciones</div>
          <button onClick={() => {
            const type = contextMenu.feature.getGeometry()?.getType();
            setPendingFeature({ feature: contextMenu.feature, type: type as string });
            setContextMenu(null);
          }} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 text-blue-700 text-left">
            <Edit size={14} /> Editar Atributos
          </button>
          <button onClick={() => {
            if (confirm("¿Estás seguro de eliminar este dibujo?")) {
              sourceRef.current?.removeFeature(contextMenu.feature);
            }
            setContextMenu(null);
          }} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 text-left">
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )}
`;

c = c.replace(
  /\{pendingFeature && \(/,
  `${contextMenuUI}\n      {pendingFeature && (`
);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
