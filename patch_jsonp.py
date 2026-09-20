import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer
          if (source && typeof source.getUrls === 'function') {
            const urls = source.getUrls();
            if (urls && urls.length > 0 && urls[0].includes('MapServer')) {
              const url = urls[0];
              fetch(url + '?f=pjson')
                .then(r => r.json())
                .then(data => {
                  const ext = data.extent || data.fullExtent;
                  if (ext) {
                    const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                    let code = 'EPSG:' + wkid;
                    try {
                      const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                      if (transformed.every(isFinite)) {
                        mapRef.current!.getView().fit(transformed, { duration: 800, padding: [50, 50, 50, 50] });
                      } else {
                        throw new Error("Invalid Extent");
                      }
                    } catch (e) {
                      // Si falla la transformación (ej. proyección local desconocida), intentamos con los valores directos
                      if ([ext.xmin, ext.ymin, ext.xmax, ext.ymax].every(isFinite)) {
                        mapRef.current!.getView().fit([ext.xmin, ext.ymin, ext.xmax, ext.ymax], { duration: 800, padding: [50, 50, 50, 50] });
                      } else {
                        alert('El servidor de ArcGIS arrojó coordenadas inválidas.');
                      }
                    }
                  } else {
                    alert('El servidor de ArcGIS no reportó la ubicación de esta capa.');
                  }
                })
                .catch(() => alert('Error obteniendo la ubicación desde el servidor ArcGIS.'));
              return;
            }
          }'''

new_code = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          if (source && typeof source.getUrls === 'function') {
            const urls = source.getUrls();
            if (urls && urls.length > 0 && urls[0].includes('MapServer')) {
              let url = urls[0];
              const params = typeof source.getParams === 'function' ? source.getParams() : {};
              if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
                const layerId = String(params.LAYERS).split(':')[1];
                url = url + '/' + layerId;
              }
              
              const callbackName = 'jsonp_' + Math.round(1000000 * Math.random());
              const script = document.createElement('script');
              script.src = url + '?f=pjson&callback=' + callbackName;
              
              (window as any)[callbackName] = (data: any) => {
                  document.body.removeChild(script);
                  delete (window as any)[callbackName];
                  
                  const ext = data.extent || data.fullExtent;
                  if (ext) {
                    const wkid = ext.spatialReference?.latestWkid || ext.spatialReference?.wkid || 4326;
                    let code = 'EPSG:' + wkid;
                    try {
                      const transformed = transformExtent([ext.xmin, ext.ymin, ext.xmax, ext.ymax], code, 'EPSG:3857');
                      if (transformed.every(isFinite)) {
                        mapRef.current!.getView().fit(transformed, { duration: 800, padding: [50, 50, 50, 50] });
                      } else {
                        throw new Error("Invalid Extent");
                      }
                    } catch (e) {
                      if ([ext.xmin, ext.ymin, ext.xmax, ext.ymax].every(isFinite)) {
                        mapRef.current!.getView().fit([ext.xmin, ext.ymin, ext.xmax, ext.ymax], { duration: 800, padding: [50, 50, 50, 50] });
                      } else {
                        alert('El servidor de ArcGIS arrojó coordenadas inválidas.');
                      }
                    }
                  } else {
                    alert('El servidor de ArcGIS no reportó la ubicación de esta capa.');
                  }
              };
              
              script.onerror = () => {
                 document.body.removeChild(script);
                 delete (window as any)[callbackName];
                 alert('Error de conexión con el servidor ArcGIS al solicitar las coordenadas.');
              };
              
              document.body.appendChild(script);
              return;
            }
          }'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added JSONP fallback for ArcGIS layers")
