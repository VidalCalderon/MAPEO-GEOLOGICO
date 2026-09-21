import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a ref for the initialization error
content = content.replace('const ol3dRef = useRef<any>(null);', 'const ol3dRef = useRef<any>(null);\\n  const ol3dErrorRef = useRef<string | null>(null);')

# Save the error
content = content.replace('alert("Error Cesium: " + (e.message || e));', 'ol3dErrorRef.current = (e.message || e);')
content = content.replace('alert("Fallo de importacion ol-cesium: " + err);', 'ol3dErrorRef.current = String(err);')

# Show the error on click
content = content.replace('alert("Activando 3D. Ref existe: " + !!ol3dRef.current);', 'alert("Activando 3D. Ref existe: " + !!ol3dRef.current + "\\nError oculto: " + ol3dErrorRef.current);')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched to show hidden error")
