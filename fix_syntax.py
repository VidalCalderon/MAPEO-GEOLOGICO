import re
with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('useState(true);\\\\n  const [openDropdown', 'useState(true);\\n  const [openDropdown')
content = content.replace('className={ bsolute top-full right-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md flex-col py-1 z-50 }', 'className={bsolute top-full right-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md flex-col py-1 z-50 }')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
