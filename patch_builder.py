import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/layerBuilder.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("newLayer.set('title', node.title);", "newLayer.set('title', node.title);\n      newLayer.set('originalUrl', node.url);")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved originalUrl")
