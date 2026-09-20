import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import BaseLayer from 'ol/layer/Base';", "import BaseLayer from 'ol/layer/Base';\nimport DraggableWidget from './DraggableWidget';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed import")
