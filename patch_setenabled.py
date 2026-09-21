import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('      if (ol3dRef.current) {\\n        ol3dRef.current.setEnabled(is3DMode);\\n      }', '      if (ol3dRef.current) {\\n        try {\\n          ol3dRef.current.setEnabled(is3DMode);\\n        } catch(e: any) {\\n          alert("Error activando 3D: " + (e.message || e));\\n        }\\n      }')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced setEnabled")
