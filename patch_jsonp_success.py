import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                  if (ext) {
                    const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                    let code = 'EPSG:' + wkid;
                    try {
                      const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                      if (transformed.every(isFinite)) {
                        mapRef.current!.getView().fit(transformed, { duration: 800, padding: [50, 50, 50, 50] });
                      } else {'''

new_code = '''                  if (ext) {
                    const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                    let code = 'EPSG:' + wkid;
                    try {
                      const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                      if (transformed.every(isFinite)) {
                        alert('Realizando zoom a coordenadas: ' + transformed.map(n => Math.round(n)).join(', '));
                        mapRef.current!.getView().fit(transformed, { duration: 800, padding: [50, 50, 50, 50] });
                      } else {'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added success alert")
