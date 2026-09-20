import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("mapRef.current!.getView().fit(peruExtent, { duration: 800, padding: [50, 50, 50, 50] });", "mapRef.current!.getView().animate({ center: transformExtent([-75, -9, -75, -9], 'EPSG:4326', 'EPSG:3857').slice(0, 2), zoom: 6, duration: 2000 });")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added dramatic animation")
