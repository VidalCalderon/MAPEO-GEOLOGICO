import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/pages/Admin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''              ) : (
                <input type="file" onChange={e => setNewFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              )}'''

replacement = '''              ) : (
                <div>
                  <input type="file" onChange={e => setNewFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Soporta: .shp (en .zip), .geojson, .json, .kml, .kmz</p>
                </div>
              )}'''

content = content.replace(target, replacement)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Admin UI")
