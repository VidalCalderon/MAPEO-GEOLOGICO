import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('const zoomToLayer = (id: string) => {')
if start_idx == -1:
    sys.exit(1)

brace_count = 0
end_idx = -1
for i in range(start_idx, len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end_idx = i + 1
            break

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
        alert("Capa no encontrada en el mapa.");
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
            }).catch(() => alert('Error TIFF'));
            return;
        }
    }

    // 2. ArcGIS
    if (arcgisUrl && typeof arcgisUrl === 'string' && arcgisUrl.includes('MapServer')) {
        let url = arcgisUrl;
        const params = source && typeof source.getParams === 'function' ? source.getParams() : {};
        if (url.endsWith('MapServer') || url.endsWith('MapServer/')) {
            if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
                const layerId = String(params.LAYERS).split(':')[1];
                if (!url.endsWith('/')) url += '/';
                url = url + layerId;
            }
        }
        
        const callbackName = 'jsonp_' + Math.round(1000000 * Math.random());
        const script = document.createElement('script');
        script.src = url + (url.includes('?') ? '&' : '?') + 'f=pjson&callback=' + callbackName;
        
        let jsonpTimeout = setTimeout(() => {
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            alert("JSONP Timeout - Forzando zoom a Perú");
            const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
            mapRef.current!.getView().fit(peruExtent, { duration: 800, padding: [50, 50, 50, 50] });
        }, 2000);

        (window as any)[callbackName] = (data: any) => {
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            
            const ext = data.extent || data.fullExtent;
            if (ext) {
                const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                let code = 'EPSG:' + wkid;
                try {
                    const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                    if (Math.abs(ext.xmax - ext.xmin) > 30) {
                        alert("Extent gigante detectado - Forzando zoom a Perú");
                        const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                        mapRef.current!.getView().fit(peruExtent, { duration: 800, padding: [50, 50, 50, 50] });
                    } else {
                        alert("Zoom normal ArcGIS: " + transformed.map(n => Math.round(n)).join(', '));
                        mapRef.current!.getView().fit(transformed, { duration: 800, padding: [50, 50, 50, 50] });
                    }
                } catch (e) {
                    alert("Error parseando coordenadas ArcGIS");
                }
            } else {
                alert("ArcGIS no devolvió extent - Forzando zoom a Perú");
                const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
                mapRef.current!.getView().fit(peruExtent, { duration: 800, padding: [50, 50, 50, 50] });
            }
        };
        
        script.onerror = () => {
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            alert("Error JSONP script tag - Forzando zoom a Perú");
            const peruExtent = transformExtent([-81.33, -18.35, -68.65, -0.03], 'EPSG:4326', 'EPSG:3857');
            mapRef.current!.getView().fit(peruExtent, { duration: 800, padding: [50, 50, 50, 50] });
        };
        
        document.body.appendChild(script);
        return;
    }

    // 3. Fallback Tradicional
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
        alert("Zoom Tradicional: " + extent.map((n: number) => Math.round(n)).join(', '));
        mapRef.current!.getView().fit(extent, { duration: 800, padding: [50, 50, 50, 50] });
    } else {
        // Fallback final
        alert("Sin coordenadas tradicionales, usando fallback general.");
        const sourceExtent = source && typeof source.getExtent === 'function' ? source.getExtent() : null;
        if (sourceExtent && sourceExtent.every(isFinite)) {
            mapRef.current!.getView().fit(sourceExtent, { duration: 800, padding: [50, 50, 50, 50] });
        }
    }
};'''

content = content[:start_idx] + new_zoomToLayer + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Rewrote zoomToLayer with full coverage alerts")
