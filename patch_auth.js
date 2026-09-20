const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// Add auth state
code = code.replace(
  'const [adminLayers, setAdminLayers] = useState<AdminLayerNode[]>([]);',
  `const [adminLayers, setAdminLayers] = useState<AdminLayerNode[]>([]);\n  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('admin_auth') === 'true');\n  const [password, setPassword] = useState('');`
);

// Add auth screen
const authCode = `
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-2xl tracking-wider text-[#4ADE80]">Y</span>
            <span className="font-semibold text-xl tracking-widest text-gray-800">UMESOKA</span>
          </div>
          <h1 className="text-xl font-bold text-[#0A2A1A] mb-2 text-center">Acceso Administrativo</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">Por favor ingresa la contraseña para acceder a las herramientas de configuración.</p>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter' && password === 'admin123') { localStorage.setItem('admin_auth', 'true'); setIsAuthenticated(true); } else if (e.key === 'Enter') { alert('Contraseña incorrecta'); } }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ADE80] mb-4"
            placeholder="Contraseña"
          />
          <button 
            onClick={() => { if (password === 'admin123') { localStorage.setItem('admin_auth', 'true'); setIsAuthenticated(true); } else { alert('Contraseña incorrecta'); } }}
            className="w-full bg-[#0A2A1A] text-white font-bold py-2 rounded hover:bg-[#124b2f] transition-colors"
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }
`;

const mainReturnIdx = code.lastIndexOf('return (');
code = code.substring(0, mainReturnIdx) + authCode + '\n  ' + code.substring(mainReturnIdx);

// Add logout button
code = code.replace(
  '<div className="p-4 border-b border-gray-200">\n             <button onClick={() => window.location.reload()} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition">\n               Aplicar y Recargar Mapa\n             </button>\n          </div>',
  `<div className="p-4 border-b border-gray-200 flex flex-col gap-3">
             <button onClick={() => window.location.reload()} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition">
               Aplicar y Recargar Mapa
             </button>
             <button onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthenticated(false); }} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition">
               Cerrar Sesión
             </button>
          </div>`
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', code);
