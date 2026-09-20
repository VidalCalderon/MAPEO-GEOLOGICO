const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

c = c.replace(/<option value="Venillas \(<10cm\)">Venillas \(<10cm\)<\/option>/g, '<option value="Venillas (<10cm)">Venillas (&lt;10cm)</option>');
c = c.replace(/<option value="Veta \(>10cm\)">Veta \(>10cm\)<\/option>/g, '<option value="Veta (>10cm)">Veta (&gt;10cm)</option>');

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
