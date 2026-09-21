import re

with open('frontend/src/pages/Admin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace useEffect load
load_replacement = '''
    const loadLayers = async () => {
      try {
        const res = await fetch("https://gimatc.pe/capas_admin.json");
        if (res.ok) {
          const data = await res.json();
          setAdminLayers(data);
          localStorage.setItem('admin_layers', JSON.stringify(data));
          return;
        }
      } catch (e) {
        console.warn("No se pudo cargar de la nube, intentando local", e);
      }
      
      // Fallback
      let raw = localStorage.getItem('admin_layers');
      if (!raw || raw === '[]') {
        const defaultLayers = [
          { id: 'grp-lito', type: 'group', title: 'LitologA-a', parentId: null, expanded: true, enabled: true },
          { id: 'grp-est-pt', type: 'group', title: 'Estructuras (Puntos)', parentId: null, expanded: true, enabled: true }
        ];
        raw = JSON.stringify(defaultLayers);
        localStorage.setItem('admin_layers', raw);
      }
      try {
        setAdminLayers(JSON.parse(raw));
      } catch (e) {
        setAdminLayers([]);
      }
    };
    loadLayers();
'''
content = re.sub(r'let raw = localStorage\.getItem\(\'admin_layers\'\);[^}]*setAdminLayers\(parsed\);\s*', load_replacement, content, count=1)

# Replace saveLayers
save_replacement = '''
    const saveLayers = async (newLayers: AdminLayerNode[]) => {
      setAdminLayers(newLayers);
      localStorage.setItem('admin_layers', JSON.stringify(newLayers));
      
      try {
        const res = await fetch("https://gimatc.pe/guardar_capas.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLayers),
        });
        if (!res.ok) {
          console.error("Error al guardar en la nube");
        }
      } catch (e) {
        console.error("Fallo de conexiA3n al guardar en la nube", e);
      }
    };
'''
content = re.sub(r'const saveLayers = \(newLayers: AdminLayerNode\[\]\) => \{[\s\S]*?localStorage\.setItem\(\'admin_layers\', JSON\.stringify\(newLayers\)\);\s*\};', save_replacement, content, count=1)

with open('frontend/src/pages/Admin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Admin.tsx")
