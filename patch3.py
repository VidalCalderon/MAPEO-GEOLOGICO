import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

broken_str = '    updateOpacityRecursive(mapRef.current.getLayers());\n    updateLayersList(mapRef.current);\n  };\n\n'
content = content.replace(broken_str, '')

broken_str2 = '    updateOpacityRecursive(mapRef.current.getLayers());\n    updateLayersList(mapRef.current);\n  };'
content = content.replace(broken_str2, '')

old_handle_start = content.find('  const handleOpacityChange = (id: string, newOpacity: number) => {')
if old_handle_start != -1:
    old_handle_end = content.find('  };', old_handle_start) + 4
    content = content[:old_handle_start] + content[old_handle_end:]

toggle_idx = content.find('  const toggleGroupExpanded = (id: string) => {')

correct_handle = '''  const handleOpacityChange = (id: string, opacity: number) => {
    if (!mapRef.current) return;
    const updateOpacityRecursive = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (layer.get('id') === id) {
          layer.setOpacity(opacity / 100);
        }
        if ((layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          updateOpacityRecursive(layer.getLayers());
        }
      });
    };
    updateOpacityRecursive(mapRef.current.getLayers());
    updateLayersList(mapRef.current);
  };

'''
content = content[:toggle_idx] + correct_handle + content[toggle_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing handleOpacityChange bug")
