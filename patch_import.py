import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('        .catch((err) => {\\n          console.error("No se pudo cargar ol-cesium", err);\\n        });', '        .catch((err) => {\\n          console.error("No se pudo cargar ol-cesium", err);\\n          alert("Fallo de importacion ol-cesium: " + err);\\n        });')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
