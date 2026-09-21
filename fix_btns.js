const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(
  /<button onClick=\{\(\) => setActiveTab\('add'\)\} className=\{`p-3 rounded-lg hover:bg-gray-700 transition \$\{activeTab === 'add' \? 'bg-blue-600 text-white' : 'text-gray-400'\}`\} title="Añadir">[\s\S]*?<Plus size=\{24\} \/>\s*<\/button>/,
  `<button onClick={() => setActiveTab('add')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-gray-400'}\`} title="Añadir">
          <Plus size={24} />
        </button>
        <button onClick={() => setActiveTab('maplayers')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTab === 'maplayers' ? 'bg-blue-600 text-white' : 'text-gray-400'}\`} title="Capas del Mapa">
          <List size={24} />
        </button>`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
