const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

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

code = code.replace(/useEffect\(\(\) => \{\s*const source = new VectorSource\(\);/, functionsCode + '\n  useEffect(() => {\n    const source = new VectorSource();');

fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
