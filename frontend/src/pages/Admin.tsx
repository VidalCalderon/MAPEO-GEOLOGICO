import React from 'react';
import MapComponent from '../components/MapComponent';

const Admin: React.FC = () => {
  return (
    <div className="flex w-full h-screen">
      {/* Panel de Configuración del Administrador */}
      <div className="w-80 bg-gray-900 text-white flex flex-col h-full shadow-2xl z-20">
        <div className="p-6 bg-gray-800 border-b border-gray-700">
          <h2 className="text-xl font-bold text-blue-400">Panel de Administración</h2>
          <p className="text-sm text-gray-400 mt-1">Configura las herramientas y capas para los usuarios finales.</p>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Herramientas Habilitadas</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span>Dibujar Polígonos</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span>Dibujar Líneas</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span>Modo OSNAP</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
             <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Capas Base</h3>
             <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-left transition border border-gray-600 text-sm">
               + Añadir Capa (WMS/Feature)
             </button>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700">
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition shadow-lg text-white">
            Publicar Proyecto
          </button>
        </div>
      </div>

      {/* Vista previa del Mapa */}
      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-20 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow text-sm">
          MODO VISTA PREVIA (ADMIN)
        </div>
        <MapComponent />
      </div>
    </div>
  );
};

export default Admin;
