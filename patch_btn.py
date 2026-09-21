import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onClick={() => setIs3DMode(!is3DMode)}', 'onClick={() => { alert("Activando 3D. Ref existe: " + !!ol3dRef.current); setIs3DMode(!is3DMode); }}')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added button alert")
