import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
start_idx = content.find('const zoomToLayer = (id: string) => {')
end_idx = content.find('  const removeCustomLayer =', start_idx)

if start_idx != -1 and end_idx != -1:
    zoom_block = content[start_idx:end_idx]
    zoom_block = zoom_block.replace('alert(', 'console.warn(')
    
    content = content[:start_idx] + zoom_block + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced alerts with console.warn")
else:
    print("Could not find blocks")
