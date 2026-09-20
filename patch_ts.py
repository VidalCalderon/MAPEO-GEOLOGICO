import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/fileLayerUtils.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
if 'import BaseLayer' not in content:
    content = content.replace("import LayerGroup from 'ol/layer/Group';", "import LayerGroup from 'ol/layer/Group';\nimport BaseLayer from 'ol/layer/Base';")
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

file_path2 = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/layerBuilder.ts'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()
content2 = content2.replace('alert("Error cargando " + node.title + ": " + (e.message || e));', 'alert("Error cargando " + node.title + ": " + ((e as any).message || e));')
with open(file_path2, 'w', encoding='utf-8') as f:
    f.write(content2)

print("Fixed TS errors")
