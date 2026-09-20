import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="flex-1 overflow-y-auto bg-white min-h-[100px]" onClick={() => setActiveMenuId(null)}',
    'className="flex-1 overflow-y-auto bg-white min-h-[100px] h-full custom-scrollbar" onClick={() => setActiveMenuId(null)}'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MapComponent scrollbar")
