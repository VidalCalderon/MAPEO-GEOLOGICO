import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

zoom_func = '''
  const zoomToLayer = (id: string) => {
    if (!mapRef.current) return;
    const findLayerAndZoom = (layersColl: any): boolean => {
      let found = false;
      layersColl.forEach((layer: any) => {
        if (found) return;
        if (layer.get('id') === id) {
          found = true;
          let extent;
          // First check if the layer has a direct extent property set (e.g. ImageLayer)
          if (typeof layer.getExtent === 'function' && layer.getExtent()) {
            extent = layer.getExtent();
          } 
          // Then check source
          else if (typeof layer.getSource === 'function') {
            const source = layer.getSource();
            if (source && typeof source.getExtent === 'function' && source.getExtent()) {
              extent = source.getExtent();
            } else if (source && typeof source.getTileGrid === 'function') {
              const tg = source.getTileGrid();
              if (tg && typeof tg.getExtent === 'function') extent = tg.getExtent();
            }
          }
          
          if (extent && extent.every((val: any) => isFinite(val))) {
            mapRef.current!.getView().fit(extent, { duration: 800, padding: [50, 50, 50, 50] });
          } else {
            alert('No se pudo determinar la ubicación de esta capa (puede que no tenga límites definidos).');
          }
        }
        if (!found && (layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          found = findLayerAndZoom(layer.getLayers());
        }
      });
      return found;
    };
    findLayerAndZoom(mapRef.current.getLayers());
  };

'''
content = content.replace('  const removeCustomLayer = (id: string, layer: BaseLayer) => {', zoom_func + '  const removeCustomLayer = (id: string, layer: BaseLayer) => {')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added zoomToLayer")
