import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import type { AdminLayerNode } from '../types/layer';
import { loadAdminFileLayerBlob, parseFileToLayer } from './fileLayerUtils';
import Collection from 'ol/Collection';
import BaseLayer from 'ol/layer/Base';

export const buildLayerTree = async (nodes: AdminLayerNode[]): Promise<BaseLayer[]> => {
  // Construir mapa de hijos
  const childrenMap = new Map<string | null, AdminLayerNode[]>();
  nodes.forEach(node => {
    const parent = node.parentId || null;
    if (!childrenMap.has(parent)) childrenMap.set(parent, []);
    childrenMap.get(parent)!.push(node);
  });

  const buildNode = async (node: AdminLayerNode): Promise<BaseLayer | null> => {
    // Ya no omitimos la capa si está "apagada" en el admin (node.enabled === false)
    // Simplemente se crea pero apagada, para que aparezca en el gestor de capas desmarcada.

    if (node.type === 'group') {
      const children = childrenMap.get(node.id) || [];
      const childLayers: BaseLayer[] = [];
      
      for (const child of children) {
        const layer = await buildNode(child);
        if (layer) childLayers.push(layer);
      }
      
      const group = new LayerGroup({
        layers: new Collection(childLayers),
      });
      group.set('title', node.title);
      group.set('id', node.id);
      group.set('isGroup', true);
      group.set('isAdmin', true);
      group.setVisible(node.enabled !== false);
      return group;
    } 
    
    // Es una capa
    if (node.isFile) {
      try {
        const blob = await loadAdminFileLayerBlob(node.id);
        if (blob) {
          const newLayer = await parseFileToLayer(blob, node.fileName || '');
          newLayer.set('title', node.title);
      newLayer.set('originalUrl', node.url);
          newLayer.set('id', node.id);
          newLayer.set('isCustom', false); 
          newLayer.set('isAdmin', true);
          newLayer.setVisible(node.enabled !== false);
          return newLayer as BaseLayer;
        }
      } catch (e) {
        console.error("Error cargando archivo:", e);
        alert("Error cargando " + node.title + ": " + ((e as any).message || e));
      }
      return null;
    } else {
      if (!node.url) return null;
      let finalUrl = node.url;
      let params: any = {};
      const match = finalUrl.match(/^(.*?\/MapServer)\/?(\d+)?$/i);
      if (match) {
        finalUrl = match[1];
        const layerId = match[2];
        if (layerId) params = { 'LAYERS': `show:${layerId}` };
      }
      
      const newLayer = new TileLayer({
        source: new TileArcGISRest({ url: finalUrl, params: params }),
      });
      newLayer.set('title', node.title);
      newLayer.set('originalUrl', node.url);
      newLayer.set('id', node.id);
      newLayer.set('isCustom', false); 
      newLayer.set('isAdmin', true);
      newLayer.setVisible(node.enabled !== false);
      return newLayer as BaseLayer;
    }
  };

  const rootNodes = childrenMap.get(null) || [];
  const rootLayers: BaseLayer[] = [];
  
  for (const node of rootNodes) {
    const layer = await buildNode(node);
    if (layer) rootLayers.push(layer);
  }

  return rootLayers;
};