import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '    // 0. Vector'
end_str = '    // 2. ArcGIS'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    exit(1)

zoom_logic = '''
    // --- NUEVO EXTENT RECURSIVO ---
    let debugLog = "DEBUG:\\n";
    const getLayerExtent = async (layer: any, depth=0): Promise<any> => {
      if (!layer) return null;
      let prefix = "  ".repeat(depth);
      debugLog += prefix + "- Tipo: " + layer.constructor.name + " | isGeoTIFF: " + layer.get('isGeoTIFF') + "\\n";
      let ext = typeof layer.getExtent === 'function' ? layer.getExtent() : null;
      if (ext && ext.every(isFinite)) {
        debugLog += prefix + "  -> Extent directo OK\\n";
        return ext;
      }

      const src = typeof layer.getSource === 'function' ? layer.getSource() : null;
      if (src) {
        debugLog += prefix + "  -> Source: " + src.constructor.name + "\\n";
        // TIFF Support
        if (layer.get('isGeoTIFF') && typeof src.getView === 'function') {
           try {
             const viewConfig = await src.getView();
             debugLog += prefix + "  -> TIFF View OK\\n";
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
           debugLog += prefix + "  -> src.getExtent(): " + (ext ? ext.join(",") : "null") + "\\n";
           if (ext && ext.every(isFinite)) return ext;
        }
        
        // Vector Support
        if (typeof src.getFeatures === 'function') {
           const features = src.getFeatures();
           debugLog += prefix + "  -> src features count: " + features.length + "\\n";
           if (features.length > 0) {
             const vExt = createEmpty();
             features.forEach((f: any) => {
               if (f.getGeometry()) extend(vExt, f.getGeometry().getExtent());
             });
             if (vExt && vExt.every(isFinite)) return vExt;
           }
        }
      }

      // Group Support
      if (typeof layer.getLayers === 'function') {
        const subLayers = layer.getLayers().getArray();
        debugLog += prefix + "  -> Group con " + subLayers.length + " capas\\n";
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
    alert("No se pudo calcular la extensión:\\n" + debugLog);

'''

content = content[:start_idx] + zoom_logic.strip() + '\n\n' + content[end_idx:]

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched!")
