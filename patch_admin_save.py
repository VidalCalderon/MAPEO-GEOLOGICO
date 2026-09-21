import re

with open('frontend/src/pages/Admin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''
    const saveLayers = async (newLayers: AdminLayerNode[]) => {
      setAdminLayers(newLayers);
      localStorage.setItem('admin_layers', JSON.stringify(newLayers));
      
      try {
        const res = await fetch("https://gimatc.pe/guardar_capas.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLayers),
        });
        const respData = await res.json().catch(()=>null);
        if (!res.ok) {
          console.error("Error al guardar en la nube", respData);
          alert("Error del servidor al guardar las capas: " + (respData?.message || res.statusText));
        } else {
          console.log("Guardado exitoso", respData);
        }
      } catch (e: any) {
        console.error("Fallo de conexiA3n al guardar en la nube", e);
        alert("Fallo de conexiA3n: No se pudo conectar a guardar_capas.php");
      }
    };
'''

content = re.sub(r'const saveLayers = async \(newLayers: AdminLayerNode\[\]\) => \{.*?\n    \};\n', replacement.strip() + '\\n', content, flags=re.DOTALL)

with open('frontend/src/pages/Admin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
