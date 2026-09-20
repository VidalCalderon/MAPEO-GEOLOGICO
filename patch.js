const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'MAPEO-GEOLOGICO', 'frontend', 'src', 'components', 'MapComponent.tsx');
let content = fs.readFileSync(filePath, 'utf-8');
let lines = content.split('\n');

const newReturnLines = `  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50">
      {mode === 'client' && (
        <>
          {/* Main Header */}
          <div className="h-14 bg-[#0A2A1A] flex items-center justify-between px-6 text-white z-40 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-wider text-[#4ADE80]">B</span>
              <span className="font-semibold text-xl tracking-widest text-gray-100">UENAVENTURA</span>
            </div>
            <div className="font-bold text-[#e1c142] text-xl tracking-wide">
              Geology integration system
            </div>
            <div>
              <button className="bg-[#e1c142] text-[#0A2A1A] px-6 py-1.5 rounded font-bold text-sm hover:bg-[#f2d253] transition-colors shadow-sm">
                Inicio
              </button>
            </div>
          </div>
          
          {/* Secondary Ribbon / Toolbar */}
          <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-end px-4 gap-3 z-30 shrink-0 shadow-sm text-sm">
            <div className="flex items-center gap-1 bg-gray-50 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors">
              <span>Analysis Tools</span>
              <ChevronDown size={16} />
            </div>
            
            <div className="relative group">
              <div className="flex items-center gap-1 bg-gray-50 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors">
                <span>Tools</span>
                <ChevronDown size={16} />
              </div>
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md hidden group-hover:flex flex-col py-1 z-50">
                <button onClick={() => setActiveTool('Polygon')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><Hexagon size={16} /> Polygon</button>
                <button onClick={() => setActiveTool('LineString')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><Minus size={16} /> LineString</button>
                <button onClick={() => setActiveTool('Point')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><MapPin size={16} /> Point</button>
                <button onClick={() => setActiveTool('Modify')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><PenTool size={16} /> Modify</button>
                <div className="h-px bg-gray-200 my-1"></div>
                <button onClick={() => setActiveTool(activeTool === 'AddLayer' ? null : 'AddLayer')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"><Database size={16} /> Add Layer</button>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveTool(activeTool === 'Basemap' ? null : 'Basemap')} className={\`p-2 rounded hover:bg-gray-100 transition \${activeTool === 'Basemap' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-600 border border-transparent'}\`} title="Mapas Base"><Globe size={18} /></button>
              <button onClick={() => setIs3DMode(!is3DMode)} className={\`p-2 rounded hover:bg-gray-100 transition \${is3DMode ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-gray-600 border border-transparent'}\`} title="Vista 3D/2D"><Box size={18} /></button>
              <button onClick={() => setActiveTool(null)} className={\`p-2 rounded hover:bg-gray-100 transition \${activeTool === null && !is3DMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 border border-transparent'}\`} title="Navegar"><MousePointer2 size={18} /></button>
            </div>
            
            <div className="relative">
              <input type="text" placeholder="Buscar herramienta..." className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#e1c142]" />
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full relative flex overflow-hidden">
        
        {/* BARRA LATERAL IZQUIERDA (Only Admin) */}
        {mode === 'admin' && (
          <div className="w-16 bg-[#2b2b2b] text-white flex flex-col items-center py-4 gap-4 z-20 shadow-2xl border-r border-gray-700 relative shrink-0">
            <button onClick={() => setActiveTool(null)} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === null && !is3DMode ? 'bg-blue-600 shadow-inner' : ''}\`} title="Navegar">
              <MousePointer2 size={24} />
            </button>
            <button onClick={() => setActiveTool('Polygon')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === 'Polygon' ? 'bg-blue-600 shadow-inner' : ''}\`} title="Dibujar Polígono">
              <Hexagon size={24} />
            </button>
            <button onClick={() => setActiveTool('LineString')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === 'LineString' ? 'bg-blue-600 shadow-inner' : ''}\`} title="Dibujar Línea">
              <Minus size={24} />
            </button>
            <button onClick={() => setActiveTool('Point')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === 'Point' ? 'bg-blue-600 shadow-inner' : ''}\`} title="Añadir Punto">
              <MapPin size={24} />
            </button>
            
            <div className="w-10 h-px bg-gray-600 my-1"></div>
            
            <button onClick={() => setActiveTool('Modify')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === 'Modify' ? 'bg-green-600 shadow-inner' : ''}\`} title="Modificar vértices">
              <PenTool size={24} />
            </button>

            <div className="w-10 h-px bg-gray-600 my-1"></div>

            <button onClick={() => setActiveTool(activeTool === 'AddLayer' ? null : 'AddLayer')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === 'AddLayer' ? 'bg-amber-600 shadow-inner' : ''}\`} title="Añadir Datos / Catálogo">
              <Database size={24} />
            </button>

            <button onClick={() => setActiveTool(activeTool === 'Basemap' ? null : 'Basemap')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTool === 'Basemap' ? 'bg-indigo-600 shadow-inner' : ''}\`} title="Cambiar Mapa Base">
              <Globe size={24} />
            </button>

            <button onClick={() => setIs3DMode(!is3DMode)} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${is3DMode ? 'bg-purple-600 shadow-inner' : 'text-gray-400'}\`} title="Cambiar vista a 3D (Globo Terráqueo)">
              <Box size={24} />
            </button>
          </div>
        )}

        {/* ÁREA DEL MAPA Y TABLA */}
        <div className="flex-1 relative bg-gray-100 flex flex-col overflow-hidden">
          
          <div className="flex-1 relative">
            <div ref={mapElement} className="absolute inset-0" />
            
            {mode === 'admin' && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg z-10 border border-gray-200">
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Web GIS</h1>
                <p className="text-sm text-gray-500 font-medium">Mapeo Geológico</p>
                {is3DMode && (
                  <div className="mt-2 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                    MODO 3D ACTIVO
                  </div>
                )}
              </div>
            )}

            {mode === 'admin' && (
              <button onClick={() => setIsLayerListOpen(!isLayerListOpen)} className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-50 border border-gray-200 text-gray-700" title="Gestor de Capas">
                <Layers size={24} />
              </button>
            )}

            {/* Overlays (Add Layer, Basemap) */}
            {activeTool === 'AddLayer' && (
              <div className={\`absolute \${mode === 'admin' ? 'left-4 top-1/4' : 'right-4 top-4'} bg-white rounded-xl shadow-2xl border border-gray-200 w-80 text-gray-800 flex flex-col overflow-hidden z-40\`}>
                <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="text-amber-600" size={20} />
                    <h3 className="font-bold text-gray-800">Añadir Datos</h3>
                  </div>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                <div className="flex flex-col">
                  <div className="flex border-b border-gray-200">
                    <button className={\`flex-1 py-2 text-xs font-medium text-center \${addMode === 'url' ? 'border-b-2 border-amber-500 text-amber-700 bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}\`} onClick={() => setAddMode('url')}>
                      <div className="flex items-center justify-center gap-1"><LinkIcon size={14}/> URL</div>
                    </button>
                    <button className={\`flex-1 py-2 text-xs font-medium text-center \${addMode === 'file' ? 'border-b-2 border-amber-500 text-amber-700 bg-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}\`} onClick={() => setAddMode('file')}>
                      <div className="flex items-center justify-center gap-1"><Database size={14}/> Archivo</div>
                    </button>
                  </div>
                  <div className="p-4">
                    {addMode === 'url' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Enlace del servicio</label>
                          <input type="text" placeholder="https://..." value={customLayerUrl} onChange={(e) => setCustomLayerUrl(e.target.value)} className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre (opcional)</label>
                          <input type="text" placeholder="Mi Mapa" value={customLayerTitle} onChange={(e) => setCustomLayerTitle(e.target.value)} className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <button onClick={handleAddCustomLayer} disabled={!customLayerUrl} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
                          <Plus size={18} /> Añadir al Mapa
                        </button>
                      </div>
                    )}
                    {addMode === 'file' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-6 text-center cursor-pointer relative hover:border-amber-500 transition-colors">
                          <input type="file" onChange={e => setCustomLayerFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          {customLayerFile ? <p className="text-sm text-amber-600 font-bold break-all">{customLayerFile.name}</p> : <p className="text-xs text-gray-500">Clic o arrastra archivo aquí</p>}
                        </div>
                        <button onClick={handleAddCustomLayer} disabled={!customLayerFile} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
                          <Plus size={18} /> Procesar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'Basemap' && (
              <div className={\`absolute \${mode === 'admin' ? 'left-4 top-1/2' : 'right-4 top-4'} bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-64 text-gray-800 z-40\`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Mapas Base</h3>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                <div className="space-y-2">
                  {BASEMAPS.map((basemap) => (
                    <button key={basemap.id} onClick={() => changeBasemap(basemap.id)} className={\`w-full text-left px-4 py-2 rounded-md text-sm transition \${activeBasemapId === basemap.id ? 'bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200' : 'hover:bg-gray-100 border border-transparent'}\`}>
                      {basemap.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom Attribute Table Panel (Only Client) */}
          {mode === 'client' && (
            <div className="h-48 bg-white border-t border-gray-300 flex flex-col z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              {/* Resizer handle (visual only for now) */}
              <div className="h-1.5 w-full bg-gray-200 cursor-row-resize flex justify-center items-center hover:bg-gray-300">
                <div className="w-8 h-0.5 bg-gray-400 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                  <span className="text-gray-800 border-b-2 border-blue-500 pb-1">UNIDAD_PROYECTOS_MINEROS</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <button className="hover:text-gray-800"><ChevronUp size={16} /></button>
                  <button className="hover:text-gray-800"><X size={16} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-gray-100 text-gray-600 sticky top-0 border-b border-gray-200 shadow-sm z-10">
                    <tr>
                      <th className="px-3 py-2 font-medium border-r border-gray-200">Altitud</th>
                      <th className="px-3 py-2 font-medium border-r border-gray-200">Calidad</th>
                      <th className="px-3 py-2 font-medium border-r border-gray-200">CARTERA_PROY</th>
                      <th className="px-3 py-2 font-medium border-r border-gray-200">CATEGORIA</th>
                      <th className="px-3 py-2 font-medium">CD_PROY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr className="hover:bg-blue-50">
                      <td className="px-3 py-1.5 border-r border-gray-100">3500</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">Calidad-B</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">20,232,024</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">Gran Mineria y Mediana M...</td>
                      <td className="px-3 py-1.5 text-blue-600 cursor-pointer">P1M</td>
                    </tr>
                    <tr className="hover:bg-blue-50 bg-gray-50">
                      <td className="px-3 py-1.5 border-r border-gray-100">3500</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">Calidad-B</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">20,232,024</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">Gran Mineria y Mediana M...</td>
                      <td className="px-3 py-1.5 text-blue-600 cursor-pointer">P1M</td>
                    </tr>
                    <tr className="hover:bg-blue-50">
                      <td className="px-3 py-1.5 border-r border-gray-100"></td>
                      <td className="px-3 py-1.5 border-r border-gray-100">Calidad-C</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">2,023,201,920,202,020</td>
                      <td className="px-3 py-1.5 border-r border-gray-100">Mediana Mineria</td>
                      <td className="px-3 py-1.5 text-blue-600 cursor-pointer">P1M</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-100 border-t border-gray-200 px-3 py-1 text-[10px] text-gray-500 flex justify-between">
                <span>Total: 126 | Selección: 0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PANEL DE GESTIÓN DE CAPAS (Flotante) */}
      <DraggableWidget 
        title="Capas del mapa" 
        isOpen={isLayerListOpen} 
        onClose={() => setIsLayerListOpen(false)}
        defaultPosition={{ x: mode === 'client' ? 24 : (window.innerWidth > 400 ? window.innerWidth - 380 : 16), y: mode === 'client' ? 120 : 16 }}
      >
        <div className="flex flex-col h-full bg-white">
          {mode === 'client' && (
            <div className="px-3 py-2 bg-[#000000] text-white text-xs flex items-center gap-2">
              <Layers size={14} /> Capas del mapa
              <div className="ml-auto flex gap-2">
                <button className="hover:text-gray-300"><ChevronUp size={14}/></button>
                <button onClick={() => setIsLayerListOpen(false)} className="hover:text-gray-300"><X size={14}/></button>
              </div>
            </div>
          )}
          {mode === 'client' && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar capa..." 
                  className="w-full text-xs pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  value={layerSearchQuery}
                  onChange={(e) => setLayerSearchQuery(e.target.value)}
                />
                <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto min-h-[100px] custom-scrollbar" onClick={() => setActiveMenuId(null)}>
            {renderUserLayerTree(layersList, 0)}
          </div>
        </div>
      </DraggableWidget>
    </div>
  );
};

export default MapComponent;
`;

let resultLines = lines.slice(0, 759);
resultLines.push(newReturnLines);

fs.writeFileSync(filePath, resultLines.join('\n'), 'utf-8');
console.log('File patched successfully');
