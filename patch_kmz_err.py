import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/fileLayerUtils.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '    const vectorLayer = new VectorLayer({'
replacement = '''    if (features.length === 0) throw new Error("El archivo KMZ no produjo geometrías legibles por OpenLayers.");
    const vectorLayer = new VectorLayer({'''
content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added error check")
