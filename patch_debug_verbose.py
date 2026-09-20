import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''  const zoomToLayer = (id: string) => {
    if (!mapRef.current) return;
    const findLayerAndZoom = (layersColl: any): boolean => {
      let found = false;
      layersColl.forEach((layer: any) => {
        if (found) return;
        if (layer.get('id') === id) {
          found = true;'''

new_code = '''  const zoomToLayer = (id: string) => {
    if (!mapRef.current) return;
    
    // Debug inicial
    console.log('Intentando hacer zoom a capa:', id);
    
    const findLayerAndZoom = (layersColl: any): boolean => {
      let found = false;
      layersColl.forEach((layer: any) => {
        if (found) return;
        if (layer.get('id') === id) {
          found = true;
          
          alert('✅ Capa encontrada: ' + layer.get('title') + '\\nEs grupo: ' + layer.get('isGroup') + '\\nTiene Source: ' + !!(typeof layer.getSource === 'function' ? layer.getSource() : null));'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added verbose find layer debug")
