import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/pages/Admin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<p className="text-[11px] text-gray-400 mt-1.5 ml-1">Soporta: .shp (en .zip), .geojson, .json, .kml, .kmz</p>',
    '<p className="text-[11px] text-gray-400 mt-1.5 ml-1">Soporta: .shp (en .zip), .geojson, .json, .kml, .kmz, .tif</p>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Admin UI with TIF")
