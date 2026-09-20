import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add proj4 imports and registration
imports = "import proj4 from 'proj4';\nimport { register } from 'ol/proj/proj4';\n\nproj4.defs('EPSG:32717', '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs');\nproj4.defs('EPSG:32718', '+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs');\nproj4.defs('EPSG:32719', '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs');\nproj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');\nregister(proj4);\n\n"

content = content.replace("import BaseLayer from 'ol/layer/Base';", "import BaseLayer from 'ol/layer/Base';\n" + imports)

# Fix zoomToLayer for GeoTIFF
target_tiff = '''              viewPromise.then((viewConfig: any) => {
                console.log('TIFF View Config:', viewConfig);
                const projCode = viewConfig.projection && typeof viewConfig.projection.getCode === 'function' 
                  ? viewConfig.projection.getCode() 
                  : viewConfig.projection;
                alert('Proyección detectada del TIFF: ' + projCode + '\\nLímites: ' + viewConfig.extent);'''

replacement_tiff = '''              viewPromise.then((viewConfig: any) => {
                const projCode = viewConfig.projection && typeof viewConfig.projection.getCode === 'function' 
                  ? viewConfig.projection.getCode() 
                  : viewConfig.projection;
                let finalExtent = viewConfig.extent;
                try {
                  if (projCode && projCode !== 'EPSG:3857') {
                    finalExtent = transformExtent(viewConfig.extent, projCode, 'EPSG:3857');
                  }
                  mapRef.current!.getView().fit(finalExtent, { duration: 800, padding: [50, 50, 50, 50] });
                } catch (e) {
                  alert('No se pudo proyectar el TIFF (' + projCode + ') a la vista del mapa.');
                }'''

content = content.replace(target_tiff, replacement_tiff)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added proj4 and fixed TIFF zoom")
