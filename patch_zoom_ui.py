import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''            <div className="flex items-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(hasMenuOpen ? null : item.id); }} 
                className={`p-1 rounded transition-colors ${hasMenuOpen ? 'bg-gray-200 text-black' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-800'}`}
              >
                <MoreHorizontal size={14}/>
              </button>
            </div>'''

replacement = '''            <div className="flex items-center gap-0.5 pr-1">
              {!item.isGroup && (
                <button 
                  onClick={(e) => { e.stopPropagation(); zoomToLayer(item.id); }} 
                  className="p-1 rounded text-gray-400 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                  title="Acercar a esta capa"
                >
                  <Search size={14}/>
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(hasMenuOpen ? null : item.id); }} 
                className={`p-1 rounded transition-colors ${hasMenuOpen ? 'bg-gray-200 text-black' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-800'}`}
              >
                <MoreHorizontal size={14}/>
              </button>
            </div>'''

content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added zoom button to UI")
