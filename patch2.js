const fs = require('fs');

const path = 'frontend/src/components/MapComponent.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const newMenuStr = `{hasMenuOpen && (
              <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 shadow-xl rounded-sm z-50 flex flex-col py-1 text-xs text-gray-700" onClick={(e) => e.stopPropagation()}>
                {item.isCustom && (
                  <button onClick={() => { removeCustomLayer(item.id, item.layer); setActiveMenuId(null); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full text-red-600 font-medium">
                    <Trash2 size={14} /> Eliminar Capa
                  </button>
                )}
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <EyeOff size={14} /> Deshabilitar elemento emergente
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Sliders size={14} /> Rango de visibilidad
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Info size={14} /> Detalles
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Search size={14} /> Definir filtro
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full">
                  <Square size={14} /> Calcular estadísticas
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full font-medium text-blue-700 bg-blue-50/50"
                  onClick={() => { handleAddToTable(item); setActiveMenuId(null); }}
                >
                  <TableProperties size={14} /> Agregar a tabla
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left w-full justify-between">
                  <div className="flex items-center gap-2"><MapIcon size={14} /> Exportar</div>
                  <ChevronRight size={14} />
                </button>
                <div className="h-px bg-gray-200 my-1 mx-2"></div>
                <div className="px-3 py-2 flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-medium text-gray-600"><Sliders size={12} /> Transparencia: {100 - item.opacity}%</span>
                  <input 
                    type="range" min="0" max="100" value={item.opacity} 
                    onChange={(e) => handleOpacityChange(item.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-gray-700 mt-1"
                  />
                </div>
              </div>
            )}`;

lines.splice(825, 17, newMenuStr);

fs.writeFileSync(path, lines.join('\n'));
