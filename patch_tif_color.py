import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/fileLayerUtils.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add geotiff import
if "import * as geotiff from 'geotiff';" not in content:
    content = content.replace("import BaseLayer from 'ol/layer/Base';", "import BaseLayer from 'ol/layer/Base';\nimport * as geotiff from 'geotiff';")

target_tif = '''  if (ext === 'tif' || ext === 'tiff') {
    const source = new GeoTIFF({
      sources: [
        {
          blob: file as File,
        },
      ],
    });
    return new WebGLTileLayer({
      source: source,
    });
  }'''

new_tif = '''  if (ext === 'tif' || ext === 'tiff') {
    try {
      // Intentamos usar la librería geotiff nativa para extraer un Canvas estático
      // Esto resuelve problemas con TIFFs indexados (paletas de colores) que WebGLTileLayer no procesa bien automáticamente
      const tiff = await geotiff.fromBlob(file as File);
      const image = await tiff.getImage();
      
      const width = image.getWidth();
      const height = image.getHeight();
      const bbox = image.getBoundingBox();
      const geoKeys = image.getGeoKeys();
      
      let projCode = 'EPSG:4326';
      if (geoKeys && geoKeys.ProjectedCSTypeGeoKey) {
         projCode = 'EPSG:' + geoKeys.ProjectedCSTypeGeoKey;
      }

      // Evitamos congelar el navegador si la imagen es masiva (> 8000x8000)
      if (width > 8192 || height > 8192) {
         // Fallback a WebGLTileLayer para imágenes gigantes
         console.warn('TIFF muy grande, usando WebGLTileLayer. Puede no mostrar colores indexados.');
         const source = new GeoTIFF({ sources: [{ blob: file as File }] });
         return new WebGLTileLayer({ source: source });
      }

      const rgb = await image.readRGB();
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2D context');
      
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      let j = 0;
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
      }
      
      ctx.putImageData(imageData, 0, 0);
      const dataURL = canvas.toDataURL();
      
      return new ImageLayer({
        source: new ImageStatic({
          url: dataURL,
          imageExtent: bbox,
          projection: projCode
        })
      });
      
    } catch (e) {
      console.error("Error procesando TIFF manualmente, intentando WebGLTileLayer...", e);
      const source = new GeoTIFF({
        sources: [{ blob: file as File }]
      });
      return new WebGLTileLayer({ source: source });
    }
  }'''

content = content.replace(target_tif, new_tif)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated TIFF parsing to use Canvas + readRGB()")
