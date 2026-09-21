import re
with open('frontend/src/utils/layerBuilder.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('layers: new Collection(childLayers),', 'layers: new Collection(childLayers.reverse()),')
content = content.replace('return rootLayers;', 'return rootLayers.reverse();')

with open('frontend/src/utils/layerBuilder.ts', 'w', encoding='utf-8') as f:
    f.write(content)
