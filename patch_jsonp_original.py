import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          let arcgisUrl = '';
          if (source && typeof source.getUrls === 'function' && source.getUrls()?.length > 0) {
             arcgisUrl = source.getUrls()[0];
          } else if (source && typeof source.getUrl === 'function' && source.getUrl()) {
             arcgisUrl = source.getUrl();
          }
          
          if (arcgisUrl && arcgisUrl.includes('MapServer')) {
              let url = arcgisUrl;
              alert('Intentando JSONP a: ' + url);
              const params = typeof source.getParams === 'function' ? source.getParams() : {};
              if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
                const layerId = String(params.LAYERS).split(':')[1];
                url = url + '/' + layerId;
              }'''

new_code = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          let arcgisUrl = layer.get('originalUrl');
          
          if (arcgisUrl && arcgisUrl.includes('MapServer')) {
              let url = arcgisUrl;
              alert('Ubicando capa de ArcGIS: ' + layer.get('title'));
              const params = typeof source.getParams === 'function' ? source.getParams() : {};
              // En ArcGIS, a veces la url de Admin ya tiene /MapServer/0, a veces no. 
              // Si la url original es sólo /MapServer y hay params.LAYERS = 'show:X', lo agregamos
              if (url.endsWith('MapServer') || url.endsWith('MapServer/')) {
                  if (params.LAYERS && String(params.LAYERS).startsWith('show:')) {
                      const layerId = String(params.LAYERS).split(':')[1];
                      if (!url.endsWith('/')) url += '/';
                      url = url + layerId;
                  }
              }'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated JSONP to use originalUrl")
