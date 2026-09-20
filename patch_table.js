const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

const tableBlockStart = `          {(tableData || isLoadingTable) && (`
const tableBlockEndMatch = `            </div>\n          )}\n        </div>`;

let startIndex = code.indexOf(tableBlockStart);
if (startIndex === -1) {
    // Maybe it doesn't have the conditional anymore?
    console.log("Could not find table block start");
    process.exit(1);
}

let remainingCode = code.substring(startIndex);
let endIndex = remainingCode.indexOf(')}\n        </div>') + ')}\n        </div>'.length;

const newTableBlock = `
          {/* TABLA DE ATRIBUTOS (SIEMPRE RENDERIZADA) */}
          <div 
            className="bg-white flex flex-col z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 relative border-t border-gray-300"
            style={{ height: isTableMinimized ? '0px' : \`\${tableHeight}px\` }}
          >
            {/* PESTAÑA PARA EXPANDIR (SOLO VISIBLE CUANDO ESTÁ MINIMIZADO) */}
            {isTableMinimized && (
              <div 
                className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-16 bg-[#111111] rounded-t-lg flex items-center justify-center cursor-pointer hover:bg-black transition-colors"
                onClick={() => setIsTableMinimized(false)}
                title="Expandir tabla"
              >
                <ChevronUp size={16} className="text-white" />
              </div>
            )}

            {/* CONTENIDO DE LA TABLA (CUANDO NO ESTÁ MINIMIZADO) */}
            {!isTableMinimized && (
              <>
                {/* Drag Handle */}
                <div 
                  className="h-2 w-full bg-gray-200 cursor-row-resize flex justify-center items-center hover:bg-gray-300"
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = tableHeight;
                    const handleMouseMove = (moveEvent) => {
                      const deltaY = startY - moveEvent.clientY;
                      const newHeight = Math.max(100, Math.min(window.innerHeight - 200, startHeight + deltaY));
                      setTableHeight(newHeight);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="w-8 h-1 bg-gray-400 rounded-full pointer-events-none"></div>
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                    <span className="text-gray-800 border-b-2 border-blue-500 pb-1 flex items-center gap-2">
                      {isLoadingTable ? 'Cargando datos...' : (tableData?.title || 'TABLA DE ATRIBUTOS').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <button className="hover:text-gray-800" title="Actualizar"><RefreshCw size={14} /></button>
                    <button className="hover:text-gray-800" title="Filtrar"><Filter size={14} /></button>
                    <button className="hover:text-gray-800" title="Mostrar/Ocultar columnas"><Columns size={14} /></button>
                    <button className="hover:text-gray-800" title="Opciones"><SlidersHorizontal size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => setIsTableMinimized(true)} className="hover:text-gray-800" title="Minimizar"><ChevronDown size={16} /></button>
                    <button onClick={() => {setTableData(null); setIsTableMinimized(true);}} className="hover:text-gray-800" title="Cerrar"><X size={16} /></button>
                  </div>
                </div>

                {/* Contenido (Tabla o Loading) */}
                <div className="flex-1 overflow-auto bg-white custom-scrollbar relative">
                  {isLoadingTable ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                  ) : tableData && tableData.rows.length > 0 ? (
                    <table className="w-full text-xs text-left whitespace-nowrap">
                      <thead className="bg-gray-100 text-gray-600 sticky top-0 border-b border-gray-200 shadow-sm z-10">
                        <tr>
                          {tableData.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 font-medium border-r border-gray-200">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {tableData.rows.map((row, rIndex) => (
                          <tr key={rIndex} className={\`hover:bg-blue-50 \${rIndex % 2 === 1 ? 'bg-gray-50/50' : ''}\`}>
                            {tableData.headers.map((h, cIndex) => (
                              <td key={cIndex} className="px-3 py-1.5 border-r border-gray-100 max-w-[200px] truncate" title={String(row[h])}>
                                {row[h] !== null && row[h] !== undefined ? String(row[h]) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No hay datos para mostrar</div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="bg-gray-100 border-t border-gray-200 px-3 py-1 text-[10px] text-gray-500 flex justify-between shrink-0">
                  <span>Total: {tableData?.rows.length || 0} | Selección: 0</span>
                </div>
              </>
            )}
          </div>
        </div>`;

code = code.substring(0, startIndex) + newTableBlock + remainingCode.substring(endIndex);
fs.writeFileSync('frontend/src/components/MapComponent.tsx', code);
console.log("Table successfully patched!");
