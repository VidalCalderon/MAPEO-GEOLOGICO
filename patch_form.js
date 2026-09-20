const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

if (!code.includes('import FeatureFormModal')) {
    code = code.replace("import DraggableWidget from './DraggableWidget';", "import DraggableWidget from './DraggableWidget';\nimport FeatureFormModal from './FeatureFormModal';\nimport Feature from 'ol/Feature';");
}

if (!code.includes('const [pendingFeature, setPendingFeature]')) {
    code = code.replace("const [addMode, setAddMode] = useState<'url' | 'file'>('url');", "const [addMode, setAddMode] = useState<'url' | 'file'>('url');\n  const [pendingFeature, setPendingFeature] = useState<{feature: Feature, type: string} | null>(null);");
}

const drawCode = `
      const draw = new Draw({
        source: source,
        type: activeTool,
      });

      draw.on('drawend', (e) => {
        // Pausar la inserción final hasta que el modal responda
        const feature = e.feature as Feature;
        
        // Removemos temporalmente el feature del source para que no se vea hasta validar
        setTimeout(() => {
           source.removeFeature(feature);
           setPendingFeature({ feature, type: activeTool });
        }, 10);
      });
`;

code = code.replace(/const draw = new Draw\(\{[\s\S]*?\}\);[\s\S]*?map\.addInteraction\(draw\);/, drawCode + '\n      map.addInteraction(draw);');

const formModalJSX = `
      {/* FORMULARIO AVANZADO MODAL */}
      {pendingFeature && (
        <FeatureFormModal 
          feature={pendingFeature.feature}
          geometryType={pendingFeature.type}
          onSave={(properties) => {
            pendingFeature.feature.setProperties(properties);
            sourceRef.current?.addFeature(pendingFeature.feature);
            setPendingFeature(null);
            // Si quieres que guarde automáticamente en la nube tras llenar el form:
            // setTimeout(() => saveServerDrawings(), 500);
          }}
          onCancel={() => {
            setPendingFeature(null);
          }}
        />
      )}
`;

code = code.replace('{/* TABLA DE ATRIBUTOS', formModalJSX + '\n          {/* TABLA DE ATRIBUTOS');

fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
