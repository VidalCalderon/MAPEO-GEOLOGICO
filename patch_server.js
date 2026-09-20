const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

if (!code.includes('import GeoJSON from')) {
    code = code.replace("import View from 'ol/View';", "import View from 'ol/View';\nimport GeoJSON from 'ol/format/GeoJSON';");
}

const functionsCode = `
  const loadServerDrawings = async () => {
    try {
      const res = await fetch('https://gimatc.pe/guardar_mapa.php');
      if (res.ok) {
        const geojson = await res.json();
        if (geojson && geojson.features && geojson.features.length > 0) {
          const format = new GeoJSON();
          const features = format.readFeatures(geojson, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
          if (sourceRef.current) {
             sourceRef.current.clear();
             sourceRef.current.addFeatures(features);
          }
        }
      }
    } catch (e) {
      console.error("Error al cargar dibujos:", e);
    }
  };

  const saveServerDrawings = async () => {
    if (!sourceRef.current) return;
    try {
      const format = new GeoJSON();
      const geojson = format.writeFeaturesObject(sourceRef.current.getFeatures(), { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
      
      const res = await fetch('https://gimatc.pe/guardar_mapa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geojson)
      });
      
      if (res.ok) {
        alert('Dibujos guardados en tu servidor cPanel exitosamente.');
      } else {
        alert('Error al guardar en el servidor.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al servidor.');
    }
  };
`;

// Insert the functions before useEffect
code = code.replace('useEffect(() => {\n\n    const source = new VectorSource();', functionsCode + '\n  useEffect(() => {\n\n    const source = new VectorSource();');

// Insert loadServerDrawings() right after loadSavedLayers(map)
code = code.replace('loadSavedLayers(map);\n\n    // Actualizar lista', 'loadSavedLayers(map);\n    loadServerDrawings();\n\n    // Actualizar lista');

// Insert the save button in the UI
// Look for `<div className="h-6 w-px bg-gray-300 mx-1"></div>` in the header
const saveButton = `
            <button 
               onClick={saveServerDrawings}
               className="flex items-center gap-2 bg-blue-600 text-white rounded px-3 py-1.5 cursor-pointer hover:bg-blue-700 font-medium transition-colors"
               title="Guardar Dibujos en cPanel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Guardar Nube</span>
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>`;

code = code.replace('<div className="h-6 w-px bg-gray-300 mx-1"></div>', saveButton);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
