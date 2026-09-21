import re
with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('children = buildTree(layer.getLayers());', 'children = buildTree(layer.getLayers()).reverse();')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
