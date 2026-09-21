const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(
  /onSave=\{\(properties\) => \{\s*pendingFeature\.feature\.setProperties\(properties\);\s*sourceRef\.current\?\.addFeature\(pendingFeature\.feature\);\s*setPendingFeature\(null\);/,
  `onSave={(properties) => {
                pendingFeature.feature.setProperties(properties);
                if (sourceRef.current && !sourceRef.current.hasFeature(pendingFeature.feature)) {
                  sourceRef.current.addFeature(pendingFeature.feature);
                }
                setPendingFeature(null);`
);

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
