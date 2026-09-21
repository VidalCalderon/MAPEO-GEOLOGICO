const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(
  '<div className="flex-1 w-full relative flex overflow-hidden">',
  `<div className="flex-1 w-full relative flex overflow-hidden">
        {activeAdminTab === 'maplayers' && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-[30] shrink-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Capas del Mapa</h2>
            </div>
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <input type="text" placeholder="Buscar capa..." className="w-full text-xs pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-500" value={layerSearchQuery} onChange={(e) => setLayerSearchQuery(e.target.value)} />
                <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[100px] custom-scrollbar" onClick={() => setActiveMenuId(null)}>
              {renderUserLayerTree(layersList, 0)}
            </div>
          </div>
        )}`
);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
