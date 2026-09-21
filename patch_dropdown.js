const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(
  /className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md hidden group-hover:flex flex-col py-1 z-50"/g,
  `className="absolute top-[calc(100%-4px)] pt-1 right-0 w-48 hidden group-hover:flex flex-col z-50"\n><div className="bg-white border border-gray-200 shadow-xl rounded-md flex flex-col py-1 mt-1"`
);

// We need to carefully replace this. Actually it's easier to just remove mt-1.
let c2 = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');
c2 = c2.replace(/mt-1 w-48 bg-white/g, 'mt-0 w-48 bg-white');

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c2);
