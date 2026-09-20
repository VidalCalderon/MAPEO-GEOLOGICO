import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/fileLayerUtils.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const dataURL = canvas.toDataURL();", "const dataURL = canvas.toDataURL();\n      console.log('TIFF Canvas Size:', width, 'x', height, 'DataURL length:', dataURL.length);")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added log")
