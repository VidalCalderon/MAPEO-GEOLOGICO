import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/components/MapComponent.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''              const callbackName = 'jsonp_' + Math.round(1000000 * Math.random());
              const script = document.createElement('script');
              script.src = url + '?f=pjson&callback=' + callbackName;'''

new_code = '''              const callbackName = 'jsonp_' + Math.round(1000000 * Math.random());
              const script = document.createElement('script');
              const finalFetchUrl = url + (url.includes('?') ? '&' : '?') + 'f=pjson&callback=' + callbackName;
              script.src = finalFetchUrl;
              alert('Ejecutando script JSONP: ' + finalFetchUrl);'''

content = content.replace(target, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added JSONP url alert")
