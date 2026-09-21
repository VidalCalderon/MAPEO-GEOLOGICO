import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Reemplazar la logica central
start_str = '    // 0. Vector'
end_str = '    // 2. ArcGIS'
start_idx = content.find(start_str)
end_idx = content.find(end_str)

zoom_logic = '''    // --- NUEVO EXTENT RECURSIVO ---
    let debugLog = "DEBUG:\\n";
    const getLayerExtent = async (layer: any, depth=0): Promise<any> => {
      if (!layer) return null;
      let prefix = "  ".repeat(depth);
      debugLog += prefix + "- Tipo: " + layer.constructor.name + " | isGeoTIFF: " + layer.get('isGeoTIFF') + "\\n";
      let ext = typeof layer.getExtent === 'function' ? layer.getExtent() : null;
      if (ext && ext.every(isFinite)) return ext;

      const src = typeof layer.getSource === 'function' ? layer.getSource() : null;
      if (src) {
        debugLog += prefix + "  -> Source: " + src.constructor.name + "\\n";
        // TIFF Support
        if (layer.get('isGeoTIFF') && typeof src.getView === 'function') {
           try {
             const viewConfig = await src.getView();
             if (viewConfig && viewConfig.extent) {
                let finalExt = viewConfig.extent;
                if (viewConfig.projection && viewConfig.projection !== "EPSG:3857") {
                    const projCode = typeof viewConfig.projection.getCode === "function" ? viewConfig.projection.getCode() : viewConfig.projection;
                    finalExt = transformExtent(viewConfig.extent, projCode, "EPSG:3857");
                }
                return finalExt;
             }
           } catch(e: any) { console.error("Error obteniendo view del TIFF: " + e.message); }
        }

        if (typeof src.getExtent === 'function') {
           ext = src.getExtent();
           if (ext && ext.every(isFinite)) return ext;
        }

        // ImageStatic Support (KMZ overlays, JPG, PNG)
        if (typeof src.getImageExtent === 'function') {
           ext = src.getImageExtent();
           if (ext && ext.every(isFinite)) return ext;
        }
        
        // Vector Support
        if (typeof src.getFeatures === 'function') {
           const features = src.getFeatures();
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
    
    // Si falla absolutamente todo, vamos a PerU
    console.warn("Fallo el zoom: " + debugLog);
    const peruExtent = transformExtent(
      [-81.33, -18.35, -68.65, -0.03],
      "EPSG:4326",
      "EPSG:3857"
    );
    mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });

'''
content = content[:start_idx] + zoom_logic.strip() + '\n\n' + content[end_idx:]

# 2. Hacerlo asincrono
content = content.replace('const zoomToLayer = (id: string) => {', 'const zoomToLayer = async (id: string) => {')

# 3. Remover el fallback viejo
start_fb = '    // 3. Fallback Tradicional para SHP/GeoJSON'
end_fb = '  const removeCustomLayer'
fb_start_idx = content.find(start_fb)
fb_end_idx = content.find(end_fb)

if fb_start_idx != -1 and fb_end_idx != -1:
    content = content[:fb_start_idx] + '  };\n\n' + content[fb_end_idx:]

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("All patched!")
