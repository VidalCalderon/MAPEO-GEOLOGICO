import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '    // 3. Fallback Tradicional para SHP/GeoJSON'
end_str = '  const removeCustomLayer'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + '  };\n\n' + content[end_idx:]
    with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed old fallback")
else:
    print("Could not find boundaries")
