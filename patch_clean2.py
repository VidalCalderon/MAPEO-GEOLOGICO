import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  const ol3dErrorRef = useRef<string | null>(null);', '')
content = content.replace('            ol3dErrorRef.current = String(e.message || e);', '')
content = content.replace('          ol3dErrorRef.current = String(err.message || err);', '')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
