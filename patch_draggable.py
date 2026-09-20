import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { ChevronRight, ChevronDown", "import DraggableWidget from './DraggableWidget';\nimport { ChevronRight, ChevronDown")

old_start = content.find('{/* PANEL DE GESTIÓN DE CAPAS')
old_end = content.find('</div>\n  );\n};')

new_panel = '''{/* PANEL DE GESTIÓN DE CAPAS (Flotante y Movible) */}
      <DraggableWidget 
        title="Capas del mapa" 
        isOpen={isLayerListOpen} 
        onClose={() => setIsLayerListOpen(false)}
        defaultPosition={{ x: window.innerWidth > 400 ? window.innerWidth - 380 : 16, y: 16 }}
      >
        <div className="flex-1 overflow-y-auto bg-white min-h-[100px]" onClick={() => setActiveMenuId(null)}>
          {renderUserLayerTree(layersList, 0)}
        </div>
      </DraggableWidget>
    '''

content = content[:old_start] + new_panel + content[old_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Integrated DraggableWidget")
