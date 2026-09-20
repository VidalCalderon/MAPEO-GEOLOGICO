import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/layerBuilder.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('console.error("Error cargando archivo:", e);', 'console.error("Error cargando archivo:", e);\n        alert("Error cargando " + node.title + ": " + (e.message || e));')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added alert")
