const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(
  "import { Plus, Layers, Map as MapIcon, Settings, Eye, EyeOff, Folder, FolderOpen, FileText, Trash2, ChevronRight, ChevronDown, Edit2, GripVertical } from 'lucide-react';",
  "import { Plus, Layers, Map as MapIcon, Settings, Eye, EyeOff, Folder, FolderOpen, FileText, Trash2, ChevronRight, ChevronDown, Edit2, GripVertical, List } from 'lucide-react';"
);

c = c.replace(
  "const [activeTab, setActiveTab] = useState<'layers' | 'add' | 'basemap' | 'settings'>('layers');",
  "const [activeTab, setActiveTab] = useState<'layers' | 'maplayers' | 'add' | 'basemap' | 'settings'>('layers');"
);

c = c.replace(
  `<button onClick={() => setActiveTab('add')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-gray-400'}\`} title="Añadir">
          <Plus size={24} />
        </button>`,
  `<button onClick={() => setActiveTab('add')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-gray-400'}\`} title="Añadir">
          <Plus size={24} />
        </button>
        <button onClick={() => setActiveTab('maplayers')} className={\`p-3 rounded-lg hover:bg-gray-700 transition \${activeTab === 'maplayers' ? 'bg-blue-600 text-white' : 'text-gray-400'}\`} title="Capas del Mapa">
          <List size={24} />
        </button>`
);

c = c.replace(
  '<div className="w-80 bg-white shadow-2xl z-20 flex flex-col border-r border-gray-200">',
  "{['add', 'layers', 'basemap', 'settings'].includes(activeTab) && <div className=\"w-80 bg-white shadow-2xl z-20 flex flex-col border-r border-gray-200\">"
);

c = c.replace(
  "</div>\n\n      <div className=\"flex-1 relative bg-gray-200\">",
  "</div>}\n\n      <div className=\"flex-1 relative bg-gray-200\">"
);

c = c.replace(
  '<MapComponent mode="admin" />',
  '<MapComponent mode="admin" activeAdminTab={activeTab} />'
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
