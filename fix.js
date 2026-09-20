const fs = require('fs');

const path = 'frontend/src/components/MapComponent.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/\{mode === 'client' && \(\s*<>\s*/g, '');
c = c.replace(/<\/div>\s*<\/>\s*\)\}\s*<div className="flex-1 w-full relative flex overflow-hidden">/g, '</div>\n\n      <div className="flex-1 w-full relative flex overflow-hidden">');

c = c.replace(/\{mode === 'admin' && \(\s*<div className="absolute top-4 left-4 bg-white\/95 [\s\S]*?<\/div>\s*\)\}/g, '');

c = c.replace(/\{mode === 'client' && \(tableData \|\| isLoadingTable\) && \(/g, '{(tableData || isLoadingTable) && (');

c = c.replace(/\{mode === 'client' && \(\s*<div className="px-3 py-2 bg-\[#000000\][\s\S]*?<\/div>\s*\)\}/g, `<div className="px-3 py-2 bg-[#000000] text-white text-xs flex items-center gap-2">
              <Layers size={14} /> Capas del mapa
              <div className="ml-auto flex gap-2">
                <button className="hover:text-gray-300"><ChevronUp size={14}/></button>
                <button onClick={() => setIsLayerListOpen(false)} className="hover:text-gray-300"><X size={14}/></button>
              </div>
            </div>`);

c = c.replace(/\{mode === 'client' && \(\s*<div className="p-2 border-b border-gray-200\">[\s\S]*?<\/div>\s*\)\}/g, `<div className="p-2 border-b border-gray-200">
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
            </div>`);

fs.writeFileSync(path, c, 'utf8');
