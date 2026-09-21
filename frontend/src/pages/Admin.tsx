import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import type { AdminLayerNode } from '../types/layer';
import { Plus, Layers, Map as MapIcon, Settings, Eye, EyeOff, Folder, FolderOpen, FileText, Trash2, ChevronRight, ChevronDown, Edit2, GripVertical, List } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const Admin: React.FC = () => {
  const [adminLayers, setAdminLayers] = useState<AdminLayerNode[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'layers' | 'maplayers' | 'add' | 'basemap' | 'settings'>('layers');
  
  const [addMode, setAddMode] = useState<'url' | 'file' | 'template'>('url');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Drag & Drop states
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | 'inside' | null>(null);

  useEffect(() => {
    let raw = localStorage.getItem('admin_layers');
    if (!raw || raw === '[]') {
      const defaultLayers = [
        { id: 'grp-lito', type: 'group', title: 'Litología', parentId: null, expanded: true, enabled: true },
        { id: 'grp-alt', type: 'group', title: 'Alteración', parentId: null, expanded: true, enabled: true },
        { id: 'grp-min', type: 'group', title: 'Mineralización', parentId: null, expanded: true, enabled: true },
        { id: 'grp-est-lin', type: 'group', title: 'Estructuras (Líneas)', parentId: null, expanded: true, enabled: true },
        { id: 'grp-est-pt', type: 'group', title: 'Estructuras (Puntos)', parentId: null, expanded: true, enabled: true }
      ];
      raw = JSON.stringify(defaultLayers);
      localStorage.setItem('admin_layers', raw);
    }
    let parsed = [];
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = [];
    }
    if (!Array.isArray(parsed)) parsed = [];
    
    if (parsed.length > 0 && !parsed[0].type) {
      parsed = parsed.map((item: any) => ({
        id: item.id || generateId(),
        type: 'layer',
        title: item.title,
        parentId: null,
        enabled: item.enabled !== false,
        url: item.url,
        isFile: item.isFile,
        fileName: item.fileName
      }));
      localStorage.setItem('admin_layers', JSON.stringify(parsed));
    }
    setAdminLayers(parsed);
  }, []);

  const saveLayers = (newLayers: AdminLayerNode[]) => {
    setAdminLayers(newLayers);
    localStorage.setItem('admin_layers', JSON.stringify(newLayers));
  };

  const handleAddGroup = () => {
    const title = prompt('Nombre del nuevo grupo:');
    if (!title) return;
    
    const newGroup: AdminLayerNode = {
      id: generateId(),
      type: 'group',
      title: title,
      parentId: selectedParentId,
      enabled: true,
      expanded: true
    };
    saveLayers([...adminLayers, newGroup]);
  };

  const handleAddLayer = async () => {
    const newNode: AdminLayerNode = {
      id: generateId(),
      type: 'layer',
      title: newTitle || 'Nueva Capa',
      parentId: selectedParentId,
      enabled: true
    };

    if (addMode === 'url') {
      if (!newUrl) return;
      newNode.url = newUrl.trim();
      saveLayers([...adminLayers, newNode]);
    } else {
      if (!newFile) return;
      const { saveAdminFileLayer } = await import('../utils/fileLayerUtils');
      await saveAdminFileLayer(newFile, newTitle);
      
      newNode.id = `file_${Date.now()}`;
      newNode.isFile = true;
      newNode.fileName = newFile.name;
      
      const localforage = (await import('localforage')).default;
      await localforage.setItem(newNode.id, newFile);
      saveLayers([...adminLayers, newNode]);
    }
    
    setNewUrl('');
    setNewTitle('');
    setNewFile(null);
    setActiveTab('layers');
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
    
    const getIdsToRemove = (parentId: string): string[] => {
      const children = adminLayers.filter(l => l.parentId === parentId);
      let ids = [parentId];
      children.forEach(c => {
        ids = [...ids, ...getIdsToRemove(c.id)];
      });
      return ids;
    };
    
    const idsToRemove = getIdsToRemove(id);
    
    const { removeAdminFileLayer } = await import('../utils/fileLayerUtils');
    for (const removeId of idsToRemove) {
      const node = adminLayers.find(l => l.id === removeId);
      if (node && node.isFile) {
        await removeAdminFileLayer(node.id);
      }
    }
    
    saveLayers(adminLayers.filter(l => !idsToRemove.includes(l.id)));
  };

  const handleToggle = (id: string) => {
    saveLayers(adminLayers.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };
  
  const handleToggleExpand = (id: string) => {
    saveLayers(adminLayers.map(l => l.id === id ? { ...l, expanded: !l.expanded } : l));
  };

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = prompt('Nuevo nombre:', currentTitle);
    if (newTitle && newTitle.trim() !== '') {
      saveLayers(adminLayers.map(l => l.id === id ? { ...l, title: newTitle.trim() } : l));
    }
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
    // Necesario para Firefox
    e.dataTransfer.setData('text/plain', id);
  };

  const onDragOver = (e: React.DragEvent, id: string, type: 'group'|'layer') => {
    e.preventDefault();
    if (draggedId === id) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    let pos: 'top' | 'bottom' | 'inside' = 'bottom';
    
    if (type === 'group') {
      if (y < rect.height * 0.25) pos = 'top';
      else if (y > rect.height * 0.75) pos = 'bottom';
      else pos = 'inside';
    } else {
      if (y < rect.height * 0.5) pos = 'top';
      else pos = 'bottom';
    }
    
    setDragOverId(id);
    setDropPosition(pos);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    setDropPosition(null);
    
    if (!draggedId || draggedId === targetId) return;
    
    // Evitar que un grupo se meta dentro de sí mismo o de sus hijos
    const getDescendants = (parentId: string): string[] => {
      return adminLayers.filter(l => l.parentId === parentId).flatMap(c => [c.id, ...getDescendants(c.id)]);
    };
    if (getDescendants(draggedId).includes(targetId)) return;

    let newLayers = [...adminLayers];
    const draggedIndex = newLayers.findIndex(l => l.id === draggedId);
    const targetIndex = newLayers.findIndex(l => l.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const draggedItem = newLayers.splice(draggedIndex, 1)[0];
    // recalcular target index ya que sacamos un elemento
    const tIndex = newLayers.findIndex(l => l.id === targetId);
    const targetItem = newLayers[tIndex];
    
    if (dropPosition === 'inside' && targetItem.type === 'group') {
      draggedItem.parentId = targetItem.id;
      newLayers.push(draggedItem);
    } else {
      draggedItem.parentId = targetItem.parentId;
      if (dropPosition === 'top') {
        newLayers.splice(tIndex, 0, draggedItem);
      } else {
        newLayers.splice(tIndex + 1, 0, draggedItem);
      }
    }
    
    saveLayers(newLayers);
    setDraggedId(null);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const renderTree = (parentId: string | null = null, depth = 0) => {
    const children = adminLayers.filter(l => l.parentId === parentId);
    if (children.length === 0 && parentId === null) return <p className="text-sm text-gray-500 italic p-4">No hay capas.</p>;
    
    return children.map(node => {
      const isDragging = draggedId === node.id;
      const isOver = dragOverId === node.id;
      
      let borderStyles = '';
      if (isOver) {
        if (dropPosition === 'top') borderStyles = 'border-t-2 border-t-blue-500';
        else if (dropPosition === 'bottom') borderStyles = 'border-b-2 border-b-blue-500';
        else if (dropPosition === 'inside') borderStyles = 'bg-blue-100 ring-2 ring-inset ring-blue-500';
      }

      return (
        <div key={node.id} className="select-none">
          <div 
            draggable
            onDragStart={(e) => onDragStart(e, node.id)}
            onDragOver={(e) => onDragOver(e, node.id, node.type)}
            onDrop={(e) => onDrop(e, node.id)}
            onDragEnd={onDragEnd}
            onDragLeave={() => setDragOverId(null)}
            className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 border-b border-gray-100 group transition-colors 
              ${selectedParentId === node.id ? 'bg-blue-50' : 'bg-white'} 
              ${isDragging ? 'opacity-50' : 'opacity-100'} 
              ${borderStyles}`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            onClick={() => node.type === 'group' && setSelectedParentId(node.id === selectedParentId ? node.parentId : node.id)}
          >
            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 pr-1">
              <GripVertical size={14} />
            </div>

            {node.type === 'group' ? (
              <button onClick={(e) => { e.stopPropagation(); handleToggleExpand(node.id); }} className="text-gray-500 hover:text-gray-800">
                {node.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-4"></span> // Spacer
            )}
            
            <span className="text-gray-400">
              {node.type === 'group' ? (node.expanded ? <FolderOpen size={16}/> : <Folder size={16}/>) : <FileText size={16}/>}
            </span>
            
            <span className={`flex-1 text-sm truncate ${node.type === 'group' ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
              {node.title}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); handleRename(node.id, node.title); }} className="p-1 text-gray-400 hover:text-green-600" title="Renombrar">
                <Edit2 size={16}/>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleToggle(node.id); }} className="p-1 text-gray-400 hover:text-blue-600" title="Alternar visibilidad">
                {node.enabled ? <Eye size={16}/> : <EyeOff size={16}/>}
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleRemove(node.id); }} className="p-1 text-gray-400 hover:text-red-600" title="Eliminar">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
          
          {node.type === 'group' && node.expanded && (
            <div>{renderTree(node.id, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  
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

  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden">
      <div className="w-16 bg-[#202020] flex flex-col items-center py-4 gap-6 z-30 shadow-xl border-r border-black">
        <button onClick={() => setActiveTab('add')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Añadir">
          <Plus size={24} />
        </button>
        <button onClick={() => setActiveTab('maplayers')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTab === 'maplayers' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Capas del Mapa">
          <List size={24} />
        </button>
        <button onClick={() => setActiveTab('layers')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTab === 'layers' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Capas">
          <Layers size={24} />
        </button>
        <button onClick={() => setActiveTab('basemap')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTab === 'basemap' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Mapa Base">
          <MapIcon size={24} />
        </button>
        <div className="flex-1"></div>
        <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-lg hover:bg-gray-700 transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Propiedades">
          <Settings size={24} />
        </button>
      </div>

      {['add', 'layers', 'basemap', 'settings'].includes(activeTab) && <div className="w-80 bg-white shadow-2xl z-20 flex flex-col border-r border-gray-200">
        {activeTab === 'layers' && (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Capas</h2>
              <button onClick={handleAddGroup} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">+ Grupo</button>
            </div>
            <div 
              className="flex-1 overflow-y-auto pb-20"
              onDragOver={(e) => {
                e.preventDefault();
                // Permitir soltar en la zona vacía para mandarlo a la raíz al final
                if (e.currentTarget === e.target) {
                  setDragOverId('root');
                  setDropPosition('bottom');
                }
              }}
              onDrop={() => {
                if (dragOverId === 'root' && draggedId) {
                  const newLayers: any[] = [...adminLayers];
                  const draggedIndex = newLayers.findIndex(l => l.id === draggedId);
                  if (draggedIndex > -1) {
                    const item = newLayers.splice(draggedIndex, 1)[0];
                    item.parentId = null;
                    newLayers.push(item);
                    saveLayers(newLayers);
                  }
                  setDragOverId(null);
                  setDraggedId(null);
                }
              }}
            >
              {renderTree(null, 0)}
              {adminLayers.length > 0 && dragOverId === 'root' && (
                <div className="h-1 bg-blue-500 w-full mt-2" />
              )}
            </div>
          </>
        )}

        {activeTab === 'add' && (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Añadir Datos</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setAddMode('url')} className={`flex-1 py-1 text-sm font-semibold ${addMode === 'url' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>URL</button>
                <button onClick={() => setAddMode('file')} className={`flex-1 py-1 text-sm font-semibold ${addMode === 'file' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>Archivo</button>
                <button onClick={() => setAddMode('template')} className={`flex-1 py-1 text-sm font-semibold ${addMode === 'template' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>Plantilla</button>
              </div>

              {addMode === 'url' ? (
                <input type="text" placeholder="URL (ej: .../MapServer)" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              ) : addMode === 'file' ? (
                <div>
                  <input type="file" onChange={e => setNewFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Soporta: .shp (en .zip), .geojson, .json, .kml, .kmz, .tif</p>
                </div>
              ) : (
                <select value={newUrl} onChange={e => {
                  setNewUrl(e.target.value);
                  if(!newTitle) setNewTitle(e.target.value);
                }} className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none">
                  <option value="">Seleccione plantilla editable...</option>
                  <option value="Litología">Litología</option>
                  <option value="Alteración">Alteración</option>
                  <option value="Mineralización">Mineralización</option>
                  <option value="Estructuras (Líneas)">Estructuras (Líneas)</option>
                  <option value="Estructuras (Puntos)">Estructuras (Puntos)</option>
                </select>
              )}

              <input type="text" placeholder="Nombre para mostrar" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />

              <div className="text-xs text-gray-500">
                Se añadirá en: <span className="font-bold text-gray-700">{selectedParentId ? adminLayers.find(l=>l.id===selectedParentId)?.title : 'Raíz (Root)'}</span>
              </div>

              <button onClick={handleAddLayer} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition">Añadir al Visor</button>
            </div>
          </>
        )}
        
        {activeTab === 'basemap' && (<div className="p-4"><p className="text-gray-500 text-sm">Configuración de mapas base próximamente.</p></div>)}
        
        {activeTab === 'settings' && (
          <div className="p-4 border-b border-gray-200">
             <button onClick={() => window.location.reload()} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition">
               Aplicar y Recargar Mapa
             </button>
          </div>
        )}
      </div>}

      <div className="flex-1 relative bg-gray-200">
        <div className="absolute top-4 right-4 z-20 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow text-sm">
          MODO VISTA PREVIA (ADMIN)
        </div>
        <MapComponent mode="admin" activeAdminTab={activeTab} />
      </div>
    </div>
  );
};

export default Admin;
