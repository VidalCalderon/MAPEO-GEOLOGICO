import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        if (layer.get('id') === id) {
          found = true;
          
          const source = typeof layer.getSource === 'function' ? layer.getSource() : null;
          const isArcGIS = source && typeof source.getUrls === 'function' && source.getUrls() && source.getUrls()[0] && source.getUrls()[0].includes('MapServer');
          
          if (!isArcGIS && source && typeof source.getUrl === 'function' && source.getUrl() && source.getUrl().includes('MapServer')) {
             alert('Aviso: El source usa getUrl() en vez de getUrls(). URL: ' + source.getUrl());
          }'''

new_code = '''        if (layer.get('id') === id) {
          found = true;
          
          const source = typeof layer.getSource === 'function' ? layer.getSource() : null;
          let sourceUrl = '';
          if (source) {
             if (typeof source.getUrls === 'function' && source.getUrls()?.length > 0) sourceUrl = source.getUrls()[0];
             else if (typeof source.getUrl === 'function' && source.getUrl()) sourceUrl = source.getUrl();
             
             // Check custom property set by us
             if (!sourceUrl && layer.get('isCustom') === false) {
                 // Try looking into the layer's properties if the source hides it
                 sourceUrl = layer.get('url') || '';
             }
          }
          if (sourceUrl) alert('Detectado URL: ' + sourceUrl);'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated to alert sourceUrl unconditionally")
