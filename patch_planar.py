import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/fileLayerUtils.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      let j = 0;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = rgb[j];
        data[i+1] = rgb[j+1];
        data[i+2] = rgb[j+2];
        
        // Transparencia básica para bordes negros puros (NoData común)
        if (rgb[j] === 0 && rgb[j+1] === 0 && rgb[j+2] === 0) {
           data[i+3] = 0; 
        } else {
           data[i+3] = 255; 
        }
        j += 3;
      }'''

replacement = '''      const pixels = width * height;
      const isPlanar = Array.isArray(rgb) || (rgb.length > 0 && typeof rgb[0] !== 'number' && rgb[0].length === pixels);
      const channels = isPlanar ? rgb.length : rgb.length / pixels;
      
      let j = 0;
      for (let i = 0; i < data.length; i += 4) {
        let r, g, b, a = 255;
        
        if (isPlanar) {
          r = rgb[0][j];
          g = rgb[1][j];
          b = rgb[2][j];
          if (channels >= 4) a = rgb[3][j];
          j++;
        } else {
          r = rgb[j];
          g = rgb[j+1];
          b = rgb[j+2];
          if (channels >= 4) a = rgb[j+3];
          j += channels;
        }

        data[i] = r;
        data[i+1] = g;
        data[i+2] = b;
        
        // Transparencia para bordes negros (NoData de ArcGIS)
        if (r === 0 && g === 0 && b === 0 && (channels < 4 || a === 255)) {
           data[i+3] = 0; 
        } else {
           data[i+3] = a; 
        }
      }'''

content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed planar rendering")
