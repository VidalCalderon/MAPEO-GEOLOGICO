import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          let arcgisUrl = layer.get('originalUrl');
          
          if (arcgisUrl && arcgisUrl.includes('MapServer')) {
              let url = arcgisUrl;'''

new_code = '''          // 2. Manejo Asíncrono para ArcGIS REST MapServer (CORS Bypass via JSONP)
          let arcgisUrl = sourceUrl || layer.get('originalUrl');
          
          if (arcgisUrl && typeof arcgisUrl === 'string' && arcgisUrl.includes('MapServer')) {
              let url = arcgisUrl;'''

content = content.replace(target, new_code)

target_alert = '''if (sourceUrl) alert('Detectado URL: ' + sourceUrl);'''
new_alert = ''''''
content = content.replace(target_alert, new_alert)

target_alert2 = '''alert('✅ Capa encontrada: ' + layer.get('title') + '\\nEs grupo: ' + layer.get('isGroup') + '\\nTiene Source: ' + !!(typeof layer.getSource === 'function' ? layer.getSource() : null));'''
new_alert2 = ''''''
content = content.replace(target_alert2, new_alert2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up alerts and fixed JSONP url")
