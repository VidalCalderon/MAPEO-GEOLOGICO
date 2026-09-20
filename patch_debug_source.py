import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        if (layer.get('id') === id) {
          found = true;
          
          const source = typeof layer.getSource === 'function' ? layer.getSource() : null;'''

new_code = '''        if (layer.get('id') === id) {
          found = true;
          
          const source = typeof layer.getSource === 'function' ? layer.getSource() : null;
          const isArcGIS = source && typeof source.getUrls === 'function' && source.getUrls() && source.getUrls()[0] && source.getUrls()[0].includes('MapServer');
          
          if (!isArcGIS && source && typeof source.getUrl === 'function' && source.getUrl() && source.getUrl().includes('MapServer')) {
             alert('Aviso: El source usa getUrl() en vez de getUrls(). URL: ' + source.getUrl());
          }'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added source type debug")
