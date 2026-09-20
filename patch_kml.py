import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/utils/fileLayerUtils.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

imports_start = content.find('import { Fill, Stroke, Style, Circle as CircleStyle } from \'ol/style\';')
imports_new = '''import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import LayerGroup from 'ol/layer/Group';
import { transformExtent } from 'ol/proj';
'''
content = content.replace('import { Fill, Stroke, Style, Circle as CircleStyle } from \'ol/style\';', imports_new)

old_kmz_start = content.find("  if (ext === 'kmz') {")
old_kmz_end = content.find("  if (ext === 'shp' || ext === 'zip') {")

new_kmz = '''  if (ext === 'kmz' || ext === 'kml') {
    let kmlText = "";
    
    if (ext === 'kml') {
      kmlText = await file.text();
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const kmlFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('.kml'));
      if (!kmlFile) throw new Error("No se encontró un archivo .kml dentro del KMZ");
      
      kmlText = await kmlFile.async("text");

      // Buscar todas las etiquetas <href> para reemplazar imágenes empaquetadas por base64
      const hrefRegex = /<href>([^<]+)<\\/href>/gi;
      let match;
      const matches = [];
      while ((match = hrefRegex.exec(kmlText)) !== null) {
        matches.push(match[1]);
      }

      for (const href of matches) {
        if (href.startsWith('http') || href.startsWith('data:')) continue;
        const imageFile = zip.files[href] || Object.values(zip.files).find(f => f.name.endsWith(href) || href.endsWith(f.name));
        if (imageFile) {
          try {
            const base64 = await imageFile.async("base64");
            let mimeType = 'image/png';
            if (href.toLowerCase().endsWith('.jpg') || href.toLowerCase().endsWith('.jpeg')) mimeType = 'image/jpeg';
            const dataUri = `data:${mimeType};base64,${base64}`;
            kmlText = kmlText.split(`<href>${href}<\\/href>`).join(`<href>${dataUri}<\\/href>`);
          } catch(e) {
            console.error("Error extrayendo imagen del kmz:", e);
          }
        }
      }
    }

    const layers: BaseLayer[] = [];

    // Parsear GroundOverlays usando DOMParser (imágenes de mapas)
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlText, "text/xml");
      const groundOverlays = xmlDoc.getElementsByTagName("GroundOverlay");
      
      for (let i = 0; i < groundOverlays.length; i++) {
        const go = groundOverlays[i];
        const icon = go.getElementsByTagName("Icon")[0];
        const latLonBox = go.getElementsByTagName("LatLonBox")[0];
        
        if (icon && latLonBox) {
          const href = icon.getElementsByTagName("href")[0]?.textContent;
          const north = parseFloat(latLonBox.getElementsByTagName("north")[0]?.textContent || "0");
          const south = parseFloat(latLonBox.getElementsByTagName("south")[0]?.textContent || "0");
          const east = parseFloat(latLonBox.getElementsByTagName("east")[0]?.textContent || "0");
          const west = parseFloat(latLonBox.getElementsByTagName("west")[0]?.textContent || "0");
          
          if (href && !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
            // extent in EPSG:4326 is [minX, minY, maxX, maxY] -> [west, south, east, north]
            const extent4326 = [west, south, east, north];
            const extent3857 = transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
            
            const imgLayer = new ImageLayer({
              source: new ImageStatic({
                url: href,
                imageExtent: extent3857,
              })
            });
            layers.push(imgLayer);
          }
        }
      }
    } catch (e) {
      console.error("Error parseando GroundOverlays:", e);
    }

    // Parsear vectores (Puntos, Líneas, Polígonos)
    const features = new KML({ extractStyles: true }).readFeatures(kmlText, {
      featureProjection: 'EPSG:3857'
    });

    if (features.length > 0) {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({ features }),
      });
      const hasStyle = features.some(f => f.getStyle() || f.getStyleFunction());
      if (!hasStyle) {
        vectorLayer.setStyle(defaultStyle);
      }
      layers.push(vectorLayer);
    }

    if (layers.length === 0) {
      throw new Error("El archivo KML/KMZ no produjo geometrías ni imágenes legibles.");
    }
    
    if (layers.length === 1) {
      return layers[0];
    } else {
      return new LayerGroup({ layers });
    }
  }

'''

# Wait, there was an old `if (ext === 'kml')` block too! We need to remove it.
old_kml_start = content.find("  if (ext === 'kml') {")
old_kml_end = content.find("  if (ext === 'kmz') {")
content = content[:old_kml_start] + new_kmz + content[old_kmz_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated KML/KMZ to support GroundOverlays")
