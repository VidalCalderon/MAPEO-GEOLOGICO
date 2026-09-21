import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('fetch("https://gimatc.pe/capas_admin.json")', 'fetch("https://gimatc.pe/leer_capas.php")')
with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('frontend/src/pages/Admin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('fetch("https://gimatc.pe/capas_admin.json")', 'fetch("https://gimatc.pe/leer_capas.php")')
with open('frontend/src/pages/Admin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
