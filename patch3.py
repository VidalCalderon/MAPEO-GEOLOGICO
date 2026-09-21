import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

zoom_func = '''
  const zoomToLayer = async (id: string) => {
    try {
      if (!mapRef.current) return;

      let targetLayer: any = null;
      const findLayer = (layersColl: any) => {
        layersColl.forEach((layer: any) => {
          if (targetLayer) return;
          if (layer.get("id") === id) targetLayer = layer;
          if (
            !targetLayer &&
            (layer.get("isGroup") === true ||
              typeof layer.getLayers === "function") &&
            layer.getLayers
          ) {
            findLayer(layer.getLayers());
          }
        });
      };
      findLayer(mapRef.current.getLayers());

      if (!targetLayer) {
        alert("Capa no encontrada en el mapa.");
        return;
      }

      const source =
        typeof targetLayer.getSource === "function"
          ? targetLayer.getSource()
          : null;

      if (!source && targetLayer.get("isGroup") && sourceRef.current) {
        const features = sourceRef.current.getFeatures();
        if (features.length > 0) {
          let groupExtent = createEmpty();
          let foundAny = false;
          
          features.forEach((f) => {
            const props = f.getProperties();
            const rootWorkspaceId = props.workspace;
            
            let catTitle = '';
            switch(props.Categoria) {
              case 'Litologia': catTitle = 'Litología'; break;
              case 'Alteracion': catTitle = 'Alteración'; break;
              case 'Mineralizacion': catTitle = 'Mineralización'; break;
              case 'LineString': catTitle = 'Estructuras (Líneas)'; break;
              case 'Point': catTitle = 'Estructuras (Puntos)'; break;
            }

            if (targetLayer.get("id") === rootWorkspaceId || targetLayer.get("title") === catTitle) {
              extend(groupExtent, f.getGeometry()!.getExtent());
              foundAny = true;
            }
          });

          if (foundAny) {
            mapRef.current.getView().fit(groupExtent, { duration: 1000, padding: [50, 50, 50, 50] });
            return;
          }
        }
      }

      let debugLog = "DEBUG:\n";
      
      const getLayerExtent = async (layer: any, depth=0): Promise<any> => {
        if (!layer) return null;
        let prefix = "  ".repeat(depth);
        debugLog += prefix + "- Tipo: " + layer.constructor.name + " | isGeoTIFF: " + layer.get('isGeoTIFF') + "\n";
        
        let ext = typeof layer.getExtent === 'function' ? layer.getExtent() : null;
        if (ext && ext.every(isFinite)) {
          debugLog += prefix + "  -> Extent de capa directo OK\n";
          return ext;
        }

        const src = typeof layer.getSource === 'function' ? layer.getSource() : null;
        if (src) {
          debugLog += prefix + "  -> Source: " + src.constructor.name + "\n";
          if (layer.get('isGeoTIFF') && typeof src.getView === 'function') {
             try {
               const viewConfig = await src.getView();
               debugLog += prefix + "  -> viewConfig keys: " + Object.keys(viewConfig).join(",") + "\n";
               if (viewConfig && viewConfig.extent) {
                  let finalExt = viewConfig.extent;
                  if (viewConfig.projection && viewConfig.projection !== "EPSG:3857") {
                      const projCode = typeof viewConfig.projection.getCode === "function" ? viewConfig.projection.getCode() : viewConfig.projection;
                      finalExt = transformExtent(viewConfig.extent, projCode, "EPSG:3857");
                  }
                  return finalExt;
               }
             } catch(e: any) { alert("Error obteniendo view del TIFF: " + e.message); }
          }

          if (typeof src.getExtent === 'function') {
             ext = src.getExtent();
             debugLog += prefix + "  -> src.getExtent(): " + (ext ? ext.join(",") : "null") + "\n";
             if (ext && ext.every(isFinite)) return ext;
          }
          
          if (typeof src.getFeatures === 'function') {
             const features = src.getFeatures();
             debugLog += prefix + "  -> src features count: " + features.length + "\n";
             if (features.length > 0) {
               const vExt = createEmpty();
               features.forEach((f: any) => {
                 if (f.getGeometry()) extend(vExt, f.getGeometry().getExtent());
               });
               if (vExt && vExt.every(isFinite)) return vExt;
             }
          }
        }

        if (typeof layer.getLayers === 'function') {
          const subLayers = layer.getLayers().getArray();
          debugLog += prefix + "  -> Group con " + subLayers.length + " capas\n";
          const groupExt = createEmpty();
          let hasExt = false;
          for (const sub of subLayers) {
             const subExt = await getLayerExtent(sub, depth+1);
             if (subExt && subExt.every(isFinite)) {
               extend(groupExt, subExt);
               hasExt = true;
             }
          }
          if (hasExt) return groupExt;
        }
        return null;
      };

      const calculatedExtent = await getLayerExtent(targetLayer);
      if (calculatedExtent && calculatedExtent.every(isFinite)) {
        mapRef.current!.getView().fit(calculatedExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        return;
      }
      
      alert("No se pudo calcular la extensión:\n" + debugLog);
    } catch (e: any) {
      alert("Error crítico en zoomToLayer: " + e.message);
    }
  };
'''

start_str = 'const zoomToLayer = async (id: string) => {'
end_str = 'const removeCustomLayer = (_id: string, layer: BaseLayer) => {'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + zoom_func.strip() + '\n\n  ' + content[end_idx:]
    with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched with debug logs!")
else:
    print("Could not find boundaries")
