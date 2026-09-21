import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add state
if 'const [openDropdown, setOpenDropdown] = useState<string | null>(null);' not in content:
    content = content.replace('const [isLayerListOpen, setIsLayerListOpen] = useState(true);', 'const [isLayerListOpen, setIsLayerListOpen] = useState(true);\\n  const [openDropdown, setOpenDropdown] = useState<string | null>(null);')

# Replace tools dropdown wrapper
tools_button_regex = r'<div className="flex items-center gap-1 bg-gray-50 rounded px-2 md:px-3 py-1 md:py-1\.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors">\s*<span>Tools</span>\s*<ChevronDown size=\{16\} />\s*</div>\s*<div className="absolute top-full right-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md hidden group-hover:flex flex-col py-1 z-50">'

tools_button_replacement = '''<div 
                className="flex items-center gap-1 bg-gray-50 rounded px-2 md:px-3 py-1 md:py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors"
                onClick={() => setOpenDropdown(openDropdown === 'tools' ? null : 'tools')}
              >
                <span>Tools</span>
                <ChevronDown size={16} />
              </div>
              <div 
                className={bsolute top-full right-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md flex-col py-1 z-50 }
                onClick={() => setOpenDropdown(null)}
              >'''

content = re.sub(tools_button_regex, tools_button_replacement, content, flags=re.DOTALL)

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
