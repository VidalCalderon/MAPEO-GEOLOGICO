const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(
  /<div className="flex gap-2">[\s\S]*?<button onClick=\{handleAddGroup\} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">\s*\+ Grupo\s*<\/button>\s*<\/div>/,
  '<button onClick={handleAddGroup} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded transition">+ Grupo</button>'
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
