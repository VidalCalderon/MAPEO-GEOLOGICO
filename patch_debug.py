import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'viewPromise.then((viewConfig: any) => {'
replacement = '''viewPromise.then((viewConfig: any) => {
                console.log('TIFF View Config:', viewConfig);
                const projCode = viewConfig.projection && typeof viewConfig.projection.getCode === 'function' 
                  ? viewConfig.projection.getCode() 
                  : viewConfig.projection;
                alert('Proyección detectada del TIFF: ' + projCode + '\\nLímites: ' + viewConfig.extent);'''

content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added debug alert")
