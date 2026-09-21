import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '        if (typeof src.getExtent === \\'function\\') {'
end_str = '        // Vector Support'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    exit(1)

new_logic = '''        if (typeof src.getExtent === 'function') {
           ext = src.getExtent();
           debugLog += prefix + "  -> src.getExtent(): " + (ext ? ext.join(",") : "null") + "\\n";
           if (ext && ext.every(isFinite)) return ext;
        }

        // ImageStatic Support (KMZ overlays, JPG, PNG)
        if (typeof src.getImageExtent === 'function') {
           ext = src.getImageExtent();
           debugLog += prefix + "  -> src.getImageExtent(): " + (ext ? ext.join(",") : "null") + "\\n";
           if (ext && ext.every(isFinite)) return ext;
        }
        
'''

content = content[:start_idx] + new_logic + content[end_idx:]

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added getImageExtent support!")
