import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "MoreVertical, Hexagon, Minus, PenTool } from 'lucide-react'",
    "MoreVertical, MoreHorizontal, Hexagon, Minus, PenTool, GripVertical, X, ChevronUp, Sliders } from 'lucide-react'"
)

# 2. States
states_old = 'const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});'
states_new = 'const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});\n  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);'
content = content.replace(states_old, states_new)

# 3. handleOpacityChange
func_insert_str = '  const toggleGroupExpanded = (id: string) => {'
opacity_func = '''  const handleOpacityChange = (id: string, opacity: number) => {
    if (!mapRef.current) return;
    const updateOpacityRecursive = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (layer.get('id') === id) {
          layer.setOpacity(opacity / 100);
        }
        if ((layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          updateOpacityRecursive(layer.getLayers());
        }
      });
    };
    updateOpacityRecursive(mapRef.current.getLayers());
    updateLayersList(mapRef.current);
  };

  const toggleGroupExpanded = (id: string) => {'''
content = content.replace(func_insert_str, opacity_func)

# 4. renderUserLayerTree
render_start = content.find('  const renderUserLayerTree')
render_end = content.find('  return (', render_start)
old_render = content[render_start:render_end]

new_render = '''  const renderUserLayerTree = (nodes: LayerItem[], depth: number = 0) => {
    let displayNodes = nodes;
    if (depth === 0 && layerSearchQuery) {
      const query = layerSearchQuery.toLowerCase();
      const filterRecursive = (items: LayerItem[]) => {
        const result: LayerItem[] = [];
        items.forEach(item => {
          if (item.title.toLowerCase().includes(query)) {
            result.push(item);
          } else if (item.children) {
            const childMatches = filterRecursive(item.children);
            if (childMatches.length > 0) result.push({ ...item, children: childMatches });
          }
        });
        return result;
      };
      displayNodes = filterRecursive(nodes);
    }

    return displayNodes.map(item => {
      const isExpanded = expandedGroups[item.id] !== false;
      const hasMenuOpen = activeMenuId === item.id;
      return (
        <div key={item.id} className=\"text-[11px] select-none\">
          <div 
            className=\"flex items-center justify-between p-1.5 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors relative\"
            style={{ paddingLeft: f\"{depth * 16 + 8}px\" }}
          >
            <div className=\"flex items-center gap-1.5 overflow-hidden flex-1\">
              <div className=\"cursor-grab text-gray-400 hover:text-gray-600\">
                <GripVertical size={14} />
              </div>

              {item.isGroup ? (
                <button onClick={(e) => { e.stopPropagation(); toggleGroupExpanded(item.id); }} className=\"text-gray-600 hover:text-gray-900 focus:outline-none\">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className=\"w-3.5\" />
              )}
              
              <button onClick={() => toggleLayerVisibility(item.id)} className=\"text-gray-700 hover:text-black focus:outline-none ml-1\">
                {item.visible ? <CheckSquare size={14} className=\"text-black bg-white rounded-sm\" /> : <Square size={14} className=\"text-gray-400\" />}
              </button>
              
              <span className={`truncate flex-1 text-gray-800 tracking-wide ml-1 ${item.isGroup ? 'font-medium' : ''}`} title={item.title}>{item.title.toUpperCase()}</span>
            </div>
            
            <div className=\"flex items-center\">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(hasMenuOpen ? null : item.id); }} 
                className={`p-1 rounded transition-colors ${hasMenuOpen ? 'bg-gray-200 text-black' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-800'}`}
              >
                <MoreHorizontal size={14}/>
              </button>
            </div>

            {hasMenuOpen && (
              <div className=\"absolute right-0 top-8 w-56 bg-white border border-gray-200 shadow-xl rounded-sm z-50 flex flex-col py-1 text-xs text-gray-700\" onClick={(e) => e.stopPropagation()}>
                {item.isCustom && (
                  <button onClick={() => { removeCustomLayer(item.id, item.layer); setActiveMenuId(null); }} className=\"flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left w-full text-red-600\">
                    <Trash2 size={12} /> Eliminar Capa
                  </button>
                )}
                <div className=\"px-3 py-2 flex flex-col gap-1\">
                  <span className=\"flex items-center gap-2 font-medium text-gray-600\"><Sliders size={12} /> Transparencia: {100 - item.opacity}%</span>
                  <input 
                    type=\"range\" min=\"0\" max=\"100\" value={item.opacity} 
                    onChange={(e) => handleOpacityChange(item.id, parseInt(e.target.value))}
                    className=\"w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-gray-700 mt-1\"
                  />
                </div>
              </div>
            )}
          </div>
          
          {item.isGroup && isExpanded && item.children && (
            <div>
              {renderUserLayerTree(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

'''
content = content.replace(old_render, new_render)

# 5. UI Wrapper
ui_old_start = content.find('{/* PANEL DE GESTI')
ui_old_end = content.find('  );', ui_old_start)
ui_old = content[ui_old_start:ui_old_end]

ui_new = '''{/* PANEL DE GESTIÓN DE CAPAS (Flotante estilo ArcGIS) */}
      {isLayerListOpen && (
        <div className=\"absolute top-4 right-4 w-[360px] bg-white shadow-2xl z-40 flex flex-col border border-gray-300 overflow-visible max-h-[90vh] font-sans\">
          {/* Header */}
          <div className=\"bg-[#111111] text-white p-2.5 flex items-center justify-between\">
            <h2 className=\"text-[12px] font-bold tracking-wide ml-1\">Capas del mapa</h2>
            <div className=\"flex items-center gap-1\">
              <button className=\"text-gray-400 hover:text-white p-1\"><ChevronUp size={14}/></button>
              <button onClick={() => setIsLayerListOpen(false)} className=\"text-gray-400 hover:text-white p-1\"><X size={14}/></button>
            </div>
          </div>

          <div className=\"flex-1 overflow-y-auto bg-white\" onClick={() => setActiveMenuId(null)}>
            {renderUserLayerTree(layersList, 0)}
          </div>
        </div>
      )}
    </div>
'''
content = content.replace(ui_old, ui_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
