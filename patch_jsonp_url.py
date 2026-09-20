import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          if (source && typeof source.getUrls === 'function') {
            const urls = source.getUrls();
            if (urls && urls.length > 0 && urls[0].includes('MapServer')) {
              let url = urls[0];'''

new_code = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          let arcgisUrl = '';
          if (source && typeof source.getUrls === 'function' && source.getUrls()?.length > 0) {
             arcgisUrl = source.getUrls()[0];
          } else if (source && typeof source.getUrl === 'function' && source.getUrl()) {
             arcgisUrl = source.getUrl();
          }
          
          if (arcgisUrl && arcgisUrl.includes('MapServer')) {
              let url = arcgisUrl;
              alert('Intentando JSONP a: ' + url);'''

content = content.replace(target, new_code)

target_end = '''              document.body.appendChild(script);
              return;
            }
          }'''

new_end = '''              document.body.appendChild(script);
              return;
          }'''

content = content.replace(target_end, new_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated JSONP check to include getUrl()")
