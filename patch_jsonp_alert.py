import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const ext = data.extent || data.fullExtent;", "const ext = data.extent || data.fullExtent;\n                  alert('Recibido de ArcGIS: ' + JSON.stringify(ext));")
content = content.replace("alert('Error de conexión con el servidor ArcGIS al solicitar las coordenadas.');", "alert('Error de conexión JSONP con: ' + script.src);")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added JSONP alerts")
