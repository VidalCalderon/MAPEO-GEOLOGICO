import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'loadSavedLayers\(map\);\s+updateLayersList\(map\);', 'loadSavedLayers(map);\\n    loadServerDrawings();\\n    updateLayersList(map);', content)

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
