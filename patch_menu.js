const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'MAPEO-GEOLOGICO', 'frontend', 'src', 'components', 'MapComponent.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add imports
content = content.replace(
  "Trash2 } from 'lucide-react';",
  "Trash2, EyeOff, Info, Map as MapIcon, TableProperties } from 'lucide-react';"
);

// Add table data state
content = content.replace(
  "const [activeMenuId, setActiveMenuId] = useState<string | null>(null);",
  "const [activeMenuId, setActiveMenuId] = useState<string | null>(null);\n  const [tableData, setTableData] = useState<{title: string, headers: string[], rows: any[]} | null>(null);\n  const [isLoadingTable, setIsLoadingTable] = useState(false);"
);

// Add handleAddToTable function
const handleAddToTableStr = `
  const handleAddToTable = (item: LayerItem) => {
    if (!item.layer) return;
    setIsLoadingTable(true);
    setTableData(null);

    const layerTitle = item.title;
    let arcgisUrl = item.layer.get('originalUrl') || item.layer.get('url') || '';
    const source = typeof item.layer.getSource === 'function' ? item.layer.getSource() : null;

    if (!arcgisUrl && source) {
        if (typeof source.getUrls === 'function' && source.getUrls()?.length > 0) arcgisUrl = source.getUrls()[0];
        else if (typeof source.getUrl === 'function' && source.getUrl()) arcgisUrl = source.getUrl();
    }

    // 1. Vector Layers (GeoJSON, SHP)
    if (source && typeof source.getFeatures === 'function') {
      const features = source.getFeatures();
      if (features.length > 0) {
        const firstProps = features[0].getProperties();
        const headers = Object.keys(firstProps).filter(k => k !== 'geometry');
        const rows = features.map((f: any) => {
          const props = f.getProperties();
          const rowData: any = {};
          headers.forEach(h => rowData[h] = props[h]);
          return rowData;
        });
        setTableData({ title: layerTitle, headers, rows });
        setIsLoadingTable(false);
        return;
      }
    }

    // 2. ArcGIS REST Layers
    if (arcgisUrl && typeof arcgisUrl === 'string' && arcgisUrl.toLowerCase().includes('mapserver')) {
      let url = arcgisUrl;
      const params = source && typeof source.getParams === 'function' ? source.getParams() : {};
      
      if (url.endsWith('/')) url = url.slice(0, -1);
      
      if (url.toLowerCase().endsWith('mapserver')) {
          if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
              const layerId = String(params.LAYERS).split(':')[1];
              url = url + '/' + layerId;
          }
      }

      if (url.toLowerCase().includes('/query')) {
          url = url.substring(0, url.toLowerCase().indexOf('/query'));
      }

      const queryUrl = url + '/query?where=1=1&outFields=*&returnGeometry=false&f=pjson';

      // Use JSONP to bypass CORS
      const callbackName = 'jsonp_table_' + Math.round(1000000 * Math.random());
      const script = document.createElement('script');
      script.src = queryUrl + '&callback=' + callbackName;

      let jsonpTimeout = setTimeout(() => {
          document.body.removeChild(script);
          delete (window as any)[callbackName];
          setIsLoadingTable(false);
          alert('Tiempo de espera agotado al obtener datos de la tabla.');
      }, 15000);

      (window as any)[callbackName] = (data: any) => {
          clearTimeout(jsonpTimeout);
          document.body.removeChild(script);
          delete (window as any)[callbackName];
          setIsLoadingTable(false);
          
          if (data && data.features && data.features.length > 0) {
              const headers = data.fields ? data.fields.map((f: any) => f.name) : Object.keys(data.features[0].attributes);
              const rows = data.features.map((f: any) => f.attributes);
              setTableData({ title: layerTitle, headers, rows });
          } else {
              alert('No se encontraron atributos para esta capa.');
          }
      };
      
      script.onerror = () => {
          clearTimeout(jsonpTimeout);
          document.body.removeChild(script);
          delete (window as any)[callbackName];
          setIsLoadingTable(false);
          alert('Error de red al intentar obtener los atributos.');
      };
      
      document.body.appendChild(script);
      return;
    }

    setIsLoadingTable(false);
    alert('No se pueden extraer atributos de este tipo de capa o la capa está vacía.');
  };
`;

content = content.replace(
  "const handleOpacityChange = (id: string, opacity: number) => {",
  handleAddToTableStr + "\n  const handleOpacityChange = (id: string, opacity: number) => {"
);

// Replace the context menu SAFELY
const menuTarget = `{hasMenuOpen && (
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
            )}`;

const newMenu = `{hasMenuOpen && (
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

content = content.replace(menuTarget, newMenu);


// Replace the Table component SAFELY
const tableTarget = `{/* Bottom Attribute Table Panel (Only Client) */}
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
          )}`;

const newTable = `{/* Bottom Attribute Table Panel (Only Client) */}
          {mode === 'client' && (tableData || isLoadingTable) && (
            <div className="h-64 bg-white border-t border-gray-300 flex flex-col z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              {/* Resizer handle */}
              <div className="h-1.5 w-full bg-gray-200 cursor-row-resize flex justify-center items-center hover:bg-gray-300">
                <div className="w-8 h-0.5 bg-gray-400 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                  <span className="text-gray-800 border-b-2 border-blue-500 pb-1 flex items-center gap-2">
                    <TableProperties size={14} />
                    {isLoadingTable ? 'Cargando datos...' : (tableData?.title || 'TABLA DE ATRIBUTOS').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <button className="hover:text-gray-800"><ChevronUp size={16} /></button>
                  <button onClick={() => setTableData(null)} className="hover:text-gray-800"><X size={16} /></button>
                </div>
              </div>

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
              
              <div className="bg-gray-100 border-t border-gray-200 px-3 py-1 text-[10px] text-gray-500 flex justify-between">
                <span>Total: {tableData?.rows.length || 0} | Selección: 0</span>
              </div>
            </div>
          )}`;

content = content.replace(tableTarget, newTable);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Menu and table patched safely!');
