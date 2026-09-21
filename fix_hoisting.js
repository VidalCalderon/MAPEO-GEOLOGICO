const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

c = c.replace(
  /const defaultWorkspace = availableLayers\.length === 1 \? availableLayers\[0\]\.id : \(localStorage\.getItem\('active_workspace'\) \|\| ''\);\s*const \[activeWorkspace, setActiveWorkspace\] = useState\(defaultWorkspace\);\s*const availableLayers = getAvailableLayers\(\);/,
  `const availableLayers = getAvailableLayers();
  const defaultWorkspace = availableLayers.length === 1 ? availableLayers[0].id : (localStorage.getItem('active_workspace') || '');
  const [activeWorkspace, setActiveWorkspace] = useState(defaultWorkspace);`
);

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
