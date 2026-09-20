const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

if (!c.includes('interface MapComponentProps')) {
    c = c.replace('const MapComponent: React.FC = () => {', 'interface MapComponentProps { mode?: "client" | "admin"; }\nconst MapComponent: React.FC<MapComponentProps> = ({ mode = "client" }) => {');
}

c = c.replace(/<div className="flex-1 overflow-y-auto min-h-\[100px\] custom-scrollbar" onClick=\{\(\) => setActiveMenuId\(null\)\}>/, `
          <div className="px-3 py-2 bg-[#000000] text-white text-xs flex items-center gap-2">
            <Layers size={14} /> Capas del mapa
            <div className="ml-auto flex gap-2">
              <button className="hover:text-gray-300"><ChevronUp size={14}/></button>
              <button onClick={() => setIsLayerListOpen(false)} className="hover:text-gray-300"><X size={14}/></button>
            </div>
          </div>
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
          <div className="flex-1 overflow-y-auto min-h-[100px] custom-scrollbar" onClick={() => setActiveMenuId(null)}>`);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
