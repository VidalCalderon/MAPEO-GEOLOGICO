import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onClick={() => { alert("3D activo: " + !is3DMode + "\\nError Oculto: " + ol3dErrorRef.current); setIs3DMode(!is3DMode); }}', 'onClick={() => setIs3DMode(!is3DMode)}')
content = content.replace('        } catch(e: any) {\\n          alert("Error activando 3D:\\n" + String(e.message || e));\\n        }', '        } catch(e: any) {\\n          console.error("Error activando 3D:\\n" + String(e.message || e));\\n        }')
content = content.replace('    const handleErr = (e: any) => alert("GLOBAL ERROR: " + (e.message || e.reason || e));', '    const handleErr = (e: any) => console.error("GLOBAL ERROR: " + (e.message || e.reason || e));')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
