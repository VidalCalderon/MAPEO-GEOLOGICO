import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
start_idx = content.find('const zoomToLayer = (id: string) => {')
end_idx = content.find('  const removeCustomLayer =', start_idx)

if start_idx != -1 and end_idx != -1:
    zoom_block = content[start_idx:end_idx]
    
    # We will replace the entire logic with a completely solid implementation
    # that uses the /query endpoint, just like the widget the user provided!
    new_zoomToLayer = '''const zoomToLayer = (id: string) => {
    if (!mapRef.current) return;
    
    let targetLayer: any = null;
    const findLayer = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (targetLayer) return;
        if (layer.get('id') === id) targetLayer = layer;
        if (!targetLayer && (layer.get('isGroup') === true || typeof layer.getLayers === 'function') && layer.getLayers) {
          findLayer(layer.getLayers());
        }
      });
    };
    findLayer(mapRef.current.getLayers());

    if (!targetLayer) {
        console.warn("Capa no encontrada en el mapa.");
        return;
    }

    const source = typeof targetLayer.getSource === 'function' ? targetLayer.getSource() : null;
    let arcgisUrl = targetLayer.get('originalUrl') || targetLayer.get('url') || '';
    if (!arcgisUrl && source) {
        if (typeof source.getUrls === 'function' && source.getUrls()?.length > 0) arcgisUrl = source.getUrls()[0];
        else if (typeof source.getUrl === 'function' && source.getUrl()) arcgisUrl = source.getUrl();
    }

    // 1. TIFF
    if (source && typeof source.getView === 'function') {
        const viewPromise = source.getView();
        if (viewPromise && typeof viewPromise.then === 'function') {
            viewPromise.then((viewConfig: any) => {
                let finalExtent = viewConfig.extent;
                if (viewConfig.projection && viewConfig.projection !== 'EPSG:3857') {
                    const projCode = typeof viewConfig.projection.getCode === 'function' ? viewConfig.projection.getCode() : viewConfig.projection;
                    finalExtent = transformExtent(viewConfig.extent, projCode, 'EPSG:3857');
                }
                mapRef.current!.getView().fit(finalExtent, { duration: 800, padding: [50, 50, 50, 50] });
            });
            return;
        }
    }

    // 2. ArcGIS
    if (arcgisUrl && typeof arcgisUrl === 'string' && arcgisUrl.includes('MapServer')) {
        let url = arcgisUrl;
        const params = source && typeof source.getParams === 'function' ? source.getParams() : {};
        let layerId = "0"; // Default
        
        if (url.endsWith('MapServer') || url.endsWith('MapServer/')) {
            if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
                layerId = String(params.LAYERS).split(':')[1];
                if (!url.endsWith('/')) url += '/';
                url = url + layerId;
            } else {
                if (!url.endsWith('/')) url += '/';
                url = url + "0"; // Try querying layer 0 as fallback
            }
        }

        const queryUrl = url + '/query?where=1=1&returnExtentOnly=true&f=pjson';
        const callbackName = 'jsonp_' + Math.round(1000000 * Math.random());
        const script = document.createElement('script');
        script.src = queryUrl + '&callback=' + callbackName;
        
        let jsonpTimeout = setTimeout(() => {
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            console.warn("JSONP Timeout - Fallback a Perú");
            const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
            mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        }, 2000);

        (window as any)[callbackName] = (data: any) => {
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            
            let ext = data.extent || data.fullExtent;
            if (ext && ext.xmin !== undefined) {
                const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                let code = 'EPSG:' + wkid;
                try {
                    const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                    if (Math.abs(ext.xmax - ext.xmin) > 30) {
                        const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                        mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
                    } else {
                        mapRef.current!.getView().fit(transformed, { duration: 1000, padding: [50, 50, 50, 50] });
                    }
                } catch (e) {
                    const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                    mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
                }
            } else {
                const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
        };
        
        script.onerror = () => {
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
            mapRef.current!.getView().fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        };
        
        document.body.appendChild(script);
        return;
    }

    // 3. Fallback Tradicional para SHP/GeoJSON
    let extent;
    if (typeof targetLayer.getExtent === 'function' && targetLayer.getExtent()) {
        extent = targetLayer.getExtent();
    } else if (source) {
        if (typeof source.getExtent === 'function' && source.getExtent()) {
            extent = source.getExtent();
        } else if (typeof source.getTileGrid === 'function') {
            const tg = source.getTileGrid();
            if (tg && typeof tg.getExtent === 'function') extent = tg.getExtent();
        }
    }
    
    if (extent && extent.every((val: any) => isFinite(val))) {
        // Expandimos ligeramente para no pegar a los bordes
        mapRef.current!.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
    } else {
        const sourceExtent = source && typeof source.getExtent === 'function' ? source.getExtent() : null;
        if (sourceExtent && sourceExtent.every(isFinite)) {
            mapRef.current!.getView().fit(sourceExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        }
    }
};'''
    
    content = content[:start_idx] + new_zoomToLayer + '\n\n' + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Rewrote zoomToLayer with queryExtent logic from the reference widget!")
else:
    print("Could not find blocks")
