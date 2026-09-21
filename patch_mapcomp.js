const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(
  "interface MapComponentProps {\n  mode?: 'client' | 'admin';\n}",
  "interface MapComponentProps {\n  mode?: 'client' | 'admin';\n  activeAdminTab?: string;\n}"
);

c = c.replace(
  "const MapComponent: React.FC<MapComponentProps> = ({ mode = 'client' }) => {",
  "const MapComponent: React.FC<MapComponentProps> = ({ mode = 'client', activeAdminTab }) => {"
);

// We need to render the layer tree on the left side if activeAdminTab === 'maplayers'
// The structure is:
// <div className="flex flex-col h-full w-full relative">
// If activeAdminTab === 'maplayers', we can add a flex-row to put a sidebar.
// But the outermost div is flex flex-col. So we can wrap the inner content in a flex-row?
// Let's look at the bottom of MapComponent.tsx

// It returns:
// return (
//   <div className="flex flex-col h-full w-full relative">
//      ...
//   </div>
// );

// Actually, the easiest way to render the sidebar inside MapComponent without breaking its layout is just absolute positioning it on the left edge, matching the width of the Admin.tsx white sidebar (w-80, which is 320px).
// So inside the return div:
// {activeAdminTab === 'maplayers' && (
//   <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-[40] flex flex-col border-r border-gray-200">
//     <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//       <h2 className="text-lg font-bold text-gray-800">Capas del Mapa</h2>
//     </div>
//     <div className="p-2 border-b border-gray-200">
//       <div className="relative">
//         <input type="text" placeholder="Buscar capa..." className="w-full text-xs pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-gray-500" value={layerSearchQuery} onChange={(e) => setLayerSearchQuery(e.target.value)} />
//         <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
//       </div>
//     </div>
//     <div className="flex-1 overflow-y-auto min-h-[100px] custom-scrollbar" onClick={() => setActiveMenuId(null)}>
//       {renderUserLayerTree(layersList, 0)}
//     </div>
//   </div>
// )}

c = c.replace(
  '<div className="flex flex-col h-full w-full relative">',
  `<div className="flex flex-col h-full w-full relative">
      {activeAdminTab === 'maplayers' && (
        <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-[40] flex flex-col border-r border-gray-200">
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

// To avoid duplicate trees, we can conditionally hide the DraggableWidget if maplayers is open.
// <DraggableWidget title="Capas del mapa" isOpen={isLayerListOpen} ...>
c = c.replace(
  '<DraggableWidget \n        title="Capas del mapa" \n        isOpen={isLayerListOpen}',
  '<DraggableWidget \n        title="Capas del mapa" \n        isOpen={isLayerListOpen && activeAdminTab !== \'maplayers\'}'
);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
