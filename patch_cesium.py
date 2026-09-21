import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('console.error("Error inicializando Cesium:", e);', 'console.error("Error inicializando Cesium:", e);\\n            alert("Fallo 3D: " + (e.message || e));')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
