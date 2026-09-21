import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

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

content = re.sub(r'// 2\. CARGAR CAPAS DE ADMINISTRADOR \([^\)]+\).*?catch \(e: any\) \{.*?\}', new_admin_load, content, flags=re.DOTALL)

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
