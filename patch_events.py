import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''    updateLayersList(map);

    // Auto-actualizar cuando lleguen capas asincronas
    const layerCollection = map.getLayers();
    const handleLayerChange = () => updateLayersList(map);
    layerCollection.on("add", handleLayerChange);
    layerCollection.on("remove", handleLayerChange);

    return () => {
      layerCollection.un("add", handleLayerChange);
      layerCollection.un("remove", handleLayerChange);
      map.setTarget(undefined);'''

content = re.sub(r'updateLayersList\(map\);\s*return \(\) => \{\s*map\.setTarget\(undefined\);', replacement, content)

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
