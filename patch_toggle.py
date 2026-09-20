import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_toggle_start = content.find('  const toggleLayerVisibility = (id: string) => {')
old_toggle_end = content.find('  };\n', old_toggle_start) + 5
old_toggle = content[old_toggle_start:old_toggle_end]

new_toggle = '''  const toggleLayerVisibility = (id: string) => {
    if (!mapRef.current) return;
    const toggleRecursive = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (layer.get('id') === id) {
          layer.setVisible(!layer.getVisible());
        }
        if ((layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          toggleRecursive(layer.getLayers());
        }
      });
    };
    toggleRecursive(mapRef.current.getLayers());
    updateLayersList(mapRef.current);
  };

'''
content = content.replace(old_toggle, new_toggle)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing toggleLayerVisibility bug")
