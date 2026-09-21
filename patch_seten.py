import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('    useEffect(() => {\\n      if (ol3dRef.current) {\\n        ol3dRef.current.setEnabled(is3DMode);\\n      }\\n    }, [is3DMode]);', '    useEffect(() => {\\n      if (ol3dRef.current) {\\n        try {\\n          ol3dRef.current.setEnabled(is3DMode);\\n        } catch(e: any) {\\n          alert("Error activando 3D:\\n" + String(e.message || e));\\n        }\\n      }\\n    }, [is3DMode]);')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
