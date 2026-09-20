import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix default expansion
target_expanded = 'const isExpanded = expandedGroups[item.id] !== false;'
replacement_expanded = 'const isExpanded = !!expandedGroups[item.id];'
content = content.replace(target_expanded, replacement_expanded)

# Fix blue checks
target_check = '<CheckSquare size={14} className="text-black bg-white rounded-sm" />'
replacement_check = '<CheckSquare size={14} className="text-blue-600 bg-white rounded-sm" />'
content = content.replace(target_check, replacement_check)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MapComponent UI")
