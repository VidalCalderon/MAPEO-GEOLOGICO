import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

render_start = content.find('  const renderUserLayerTree')
main_return = content.find('  return (\n    <div className="w-full h-full relative flex overflow-hidden">')

new_render = '''  const renderUserLayerTree = (nodes: LayerItem[], depth: number = 0) => {
    let displayNodes = nodes;
    if (depth === 0 && layerSearchQuery) {
      const query = layerSearchQuery.toLowerCase();
      const filterRecursive = (items: LayerItem[]): LayerItem[] => {
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
        <div key={item.id} className="text-[11px] select-none">
          <div 
            className="flex items-center justify-between p-1.5 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors relative"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <div className="flex items-center gap-1.5 overflow-hidden flex-1">
              <div className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical size={14} />
              </div>

              {item.isGroup ? (
                <button onClick={(e) => { e.stopPropagation(); toggleGroupExpanded(item.id); }} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className="w-3.5" />
              )}
              
              <button onClick={() => toggleLayerVisibility(item.id)} className="text-gray-700 hover:text-black focus:outline-none ml-1">
                {item.visible ? <CheckSquare size={14} className="text-black bg-white rounded-sm" /> : <Square size={14} className="text-gray-400" />}
              </button>
              
              <span className={`truncate flex-1 text-gray-800 tracking-wide ml-1 ${item.isGroup ? 'font-medium' : ''}`} title={item.title}>{item.title.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuId(hasMenuOpen ? null : item.id); }} 
                className={`p-1 rounded transition-colors ${hasMenuOpen ? 'bg-gray-200 text-black' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-800'}`}
              >
                <MoreHorizontal size={14}/>
              </button>
            </div>

            {hasMenuOpen && (
              <div className="absolute right-0 top-8 w-56 bg-white border border-gray-200 shadow-xl rounded-sm z-50 flex flex-col py-1 text-xs text-gray-700" onClick={(e) => e.stopPropagation()}>
                {item.isCustom && (
                  <button onClick={() => { removeCustomLayer(item.id, item.layer); setActiveMenuId(null); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left w-full text-red-600">
                    <Trash2 size={12} /> Eliminar Capa
                  </button>
                )}
                <div className="px-3 py-2 flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-medium text-gray-600"><Sliders size={12} /> Transparencia: {100 - item.opacity}%</span>
                  <input 
                    type="range" min="0" max="100" value={item.opacity} 
                    onChange={(e) => handleOpacityChange(item.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-gray-700 mt-1"
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

content = content[:render_start] + new_render + content[main_return:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done syntax fix!')
