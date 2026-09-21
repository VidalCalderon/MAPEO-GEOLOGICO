const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(/,\s*, MousePointer2/, ', MousePointer2');

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
