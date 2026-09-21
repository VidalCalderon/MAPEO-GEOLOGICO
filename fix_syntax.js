const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

c = c.replace(
  /<\/div>\r?\n\r?\n\s*<div className="flex-1 relative bg-gray-200">/,
  '</div>}\n\n      <div className="flex-1 relative bg-gray-200">'
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', c);
