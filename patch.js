const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf-8');
const startStr = '{activeTool === "AddLayer" && (';
const endStr = '            {activeTool === "Basemap" && (';

const parts = content.split(startStr);
if (parts.length > 1) {
    const before = parts[0];
    const after = parts[1];
    const afterParts = after.split(endStr);
    
    const newAddLayer = {activeTool === "AddLayer" && (
              <div
                className={\bsolute \ bg-white shadow-xl border border-gray-200 w-80 text-gray-800 flex flex-col z-40\}
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-[#002244] text-lg">Añadir Datos</h3>
                  <button
                    onClick={() => setActiveTool(null)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-col">
                  <div className="flex border-b border-gray-200 bg-gray-50 p-2 gap-1">
                    <button
                      className={\lex-1 py-1.5 text-sm rounded border \\}
                      onClick={() => setAddMode("url")}
                    >
                      URL
                    </button>
                    <button
                      className={\lex-1 py-1.5 text-sm rounded border \\}
                      onClick={() => setAddMode("file")}
                    >
                      Archivo
                    </button>
                    <button
                      className={\lex-1 py-1.5 text-sm rounded border \\}
                      onClick={() => setAddMode("template")}
                    >
                      Plantilla
                    </button>
                  </div>
                  <div className="p-4">
                    {addMode === "url" && (
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="URL (ej: .../MapServer)"
                          value={customLayerUrl}
                          onChange={(e) => setCustomLayerUrl(e.target.value)}
                          className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Nombre para mostrar"
                          value={customLayerTitle}
                          onChange={(e) => setCustomLayerTitle(e.target.value)}
                          className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500">Se añadirá en: <strong>Raíz (Root)</strong></p>
                        <button
                          onClick={handleAddCustomLayer}
                          disabled={!customLayerUrl}
                          className="w-full bg-[#165ef0] hover:bg-blue-600 text-white font-bold py-2 rounded transition disabled:opacity-50"
                        >
                          Añadir al Visor
                        </button>
                      </div>
                    )}
                    {addMode === "file" && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-6 text-center cursor-pointer relative hover:border-[#165ef0] transition-colors">
                          <input
                            type="file"
                            onChange={(e) =>
                              setCustomLayerFile(e.target.files?.[0] || null)
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {customLayerFile ? (
                            <p className="text-sm text-blue-600 font-bold break-all">
                              {customLayerFile.name}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Clic o arrastra archivo aquí
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleAddCustomLayer}
                          disabled={!customLayerFile}
                          className="w-full bg-[#165ef0] hover:bg-blue-600 text-white font-bold py-2 rounded transition disabled:opacity-50"
                        >
                          Añadir al Visor
                        </button>
                      </div>
                    )}
                    {addMode === "template" && (
                      <div className="space-y-4 text-center py-4 text-gray-500 text-sm">
                         <p>Las plantillas de datos estarán disponibles próximamente.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
;
    
    fs.writeFileSync('frontend/src/components/MapComponent.tsx', before + newAddLayer + endStr + afterParts[1], 'utf-8');
    console.log("Patched successfully!");
}
