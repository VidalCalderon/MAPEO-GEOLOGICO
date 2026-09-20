const fs = require('fs');

const path = 'frontend/src/components/MapComponent.tsx';
let c = fs.readFileSync(path, 'utf8');

// Remove sidebar
c = c.replace(/\{mode === 'admin' && \(\s*<div className="w-16 bg-\[#2b2b2b\] text-white flex flex-col items-center py-4 gap-4 z-20 shadow-2xl border-r border-gray-700 relative shrink-0">[\s\S]*?<\/div>\s*\)\}/g, '');

// Add onDoubleClick
c = c.replace(/<div \s*className="flex items-center justify-between p-1\.5 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors relative"/g, '<div onDoubleClick={() => zoomToLayer(item.id)} className="flex items-center justify-between p-1.5 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors relative cursor-pointer"');

// Add vector zoom logic back
const vectorZoomStr = `
    // 0. Vector
    if (source && typeof source.getExtent === 'function') {
        const extent = source.getExtent();
        if (extent && extent[0] !== Infinity && extent[0] !== -Infinity) {
            mapRef.current!.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            return;
        }
    }

    // 1. TIFF`;
c = c.replace(/\/\/ 1\. TIFF/, vectorZoomStr);

fs.writeFileSync(path, c, 'utf8');
