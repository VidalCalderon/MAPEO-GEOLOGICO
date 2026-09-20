import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix imports
content = content.replace("import { fromLonLat } from 'ol/proj';", "import { fromLonLat, transformExtent } from 'ol/proj';")

# Fix zoomToLayer
target_zoom = '''  const zoomToLayer = (id: string) => {
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
  };'''

new_zoom = '''  const zoomToLayer = (id: string) => {
    if (!mapRef.current) return;
    const findLayerAndZoom = (layersColl: any): boolean => {
      let found = false;
      layersColl.forEach((layer: any) => {
        if (found) return;
        if (layer.get('id') === id) {
          found = true;
          
          const source = typeof layer.getSource === 'function' ? layer.getSource() : null;

          // 1. Manejo Asíncrono para GeoTIFF
          if (source && typeof source.getView === 'function') {
            const viewPromise = source.getView();
            if (viewPromise && typeof viewPromise.then === 'function') {
              viewPromise.then((viewConfig: any) => {
                if (viewConfig && viewConfig.extent) {
                  mapRef.current!.getView().fit(viewConfig.extent, { duration: 800, padding: [50, 50, 50, 50] });
                } else {
                  alert('La imagen TIFF no tiene límites definidos internamente.');
                }
              }).catch(() => alert('Error leyendo las coordenadas del TIFF.'));
              return;
            }
          }

          // 2. Manejo Asíncrono para ArcGIS REST MapServer
          if (source && typeof source.getUrls === 'function') {
            const urls = source.getUrls();
            if (urls && urls.length > 0 && urls[0].includes('MapServer')) {
              const url = urls[0];
              fetch(url + '?f=pjson')
                .then(r => r.json())
                .then(data => {
                  const ext = data.extent || data.fullExtent;
                  if (ext) {
                    const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                    let code = 'EPSG:' + wkid;
                    try {
                      const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                      if (transformed.every(isFinite)) {
                        mapRef.current!.getView().fit(transformed, { duration: 800, padding: [50, 50, 50, 50] });
                      } else {
                        throw new Error("Invalid Extent");
                      }
                    } catch (e) {
                      // Si falla la transformación (ej. proyección local desconocida), intentamos con los valores directos
                      if ([ext.xmin, ext.ymin, ext.xmax, ext.ymax].every(isFinite)) {
                        mapRef.current!.getView().fit([ext.xmin, ext.ymin, ext.xmax, ext.ymax], { duration: 800, padding: [50, 50, 50, 50] });
                      } else {
                        alert('El servidor de ArcGIS arrojó coordenadas inválidas.');
                      }
                    }
                  } else {
                    alert('El servidor de ArcGIS no reportó la ubicación de esta capa.');
                  }
                })
                .catch(() => alert('Error obteniendo la ubicación desde el servidor ArcGIS.'));
              return;
            }
          }

          // 3. Manejo Síncrono Tradicional (Vectores, KML, GeoJSON, etc)
          let extent;
          if (typeof layer.getExtent === 'function' && layer.getExtent()) {
            extent = layer.getExtent();
          } else if (source) {
            if (typeof source.getExtent === 'function' && source.getExtent()) {
              extent = source.getExtent();
            } else if (typeof source.getTileGrid === 'function') {
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
  };'''

content = content.replace(target_zoom, new_zoom)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated zoom function for async layers")
