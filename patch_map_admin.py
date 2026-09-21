import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace admin layer loading in loadSavedLayers
old_admin_load = '''    // 2. CARGAR CAPAS DE ADMINISTRADOR (A?rbol)
    try {
      const adminSaved = localStorage.getItem("admin_layers");
      if (adminSaved) {
        const adminNodes = JSON.parse(adminSaved);
        if (Array.isArray(adminNodes)) {
          const { buildLayerTree } = await import("../utils/layerBuilder");
          const rootLayers = await buildLayerTree(adminNodes);
          rootLayers.forEach((layer) => map.addLayer(layer));
        }
      }
    } catch (e: any) {
      console.error("Error cargando Arbol de admin:", e);
    }'''

new_admin_load = '''    // 2. CARGAR CAPAS DE ADMINISTRADOR (A?rbol) DESDE LA NUBE
    try {
      let adminNodes = null;
      try {
        const res = await fetch("https://gimatc.pe/capas_admin.json");
        if (res.ok) {
          adminNodes = await res.json();
        }
      } catch (cloudErr) {
        console.warn("No se pudo cargar de la nube, intentando local", cloudErr);
      }
      
      // Fallback a local si falla
      if (!adminNodes) {
        const adminSaved = localStorage.getItem("admin_layers");
        if (adminSaved) adminNodes = JSON.parse(adminSaved);
      }

      if (Array.isArray(adminNodes)) {
        const { buildLayerTree } = await import("../utils/layerBuilder");
        const rootLayers = await buildLayerTree(adminNodes);
        rootLayers.forEach((layer) => map.addLayer(layer));
      }
    } catch (e: any) {
      console.error("Error cargando Arbol de admin:", e);
    }'''

# Replace it using string replace (with careful whitespace)
content = content.replace('    // 2. CARGAR CAPAS DE ADMINISTRADOR (A?rbol)\\n    try {\\n      const adminSaved = localStorage.getItem("admin_layers");\\n      if (adminSaved) {\\n        const adminNodes = JSON.parse(adminSaved);\\n        if (Array.isArray(adminNodes)) {\\n          const { buildLayerTree } = await import("../utils/layerBuilder");\\n          const rootLayers = await buildLayerTree(adminNodes);\\n          rootLayers.forEach((layer) => map.addLayer(layer));\\n        }\\n      }\\n    } catch (e: any) {\\n      console.error("Error cargando Arbol de admin:", e);\\n    }', new_admin_load)

# Fallback regex if literal replace fails due to encoding/newlines
content = re.sub(r'// 2\. CARGAR CAPAS DE ADMINISTRADOR \(A\?rbol\).*?console\.error\("Error cargando Arbol de admin:", e\);\s*\}', new_admin_load, content, flags=re.DOTALL)

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched MapComponent.tsx loadSavedLayers")
