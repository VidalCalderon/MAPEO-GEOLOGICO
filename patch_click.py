import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const zoomToLayer = (id: string) => {", "const zoomToLayer = (id: string) => {\n    alert('CLICK!');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected CLICK")
