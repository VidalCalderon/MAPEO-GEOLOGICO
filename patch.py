import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = 'const zoomToLayer = (id: string) => {'
end_str = 'const removeCustomLayer = (_id: string, layer: BaseLayer) => {'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print('Could not find boundaries')
    exit(1)

new_zoomToLayer = '''const zoomToLayer = async (id: string) => {
    if (!mapRef.current) return;

    let targetLayer: any = null;
    const findLayer = (layersColl: any) => {
      layersColl.forEach((layer: any) => {
        if (targetLayer) return;
        if (layer.get("id") === id) targetLayer = layer;
        if (
          !targetLayer &&
          (layer.get("isGroup") === true ||
            typeof layer.getLayers === "function") &&
          layer.getLayers
        ) {
          findLayer(layer.getLayers());
        }
      });
    };
    findLayer(mapRef.current.getLayers());

    if (!targetLayer) {
      console.warn("Capa no encontrada en el mapa.");
      return;
    }

    const source =
      typeof targetLayer.getSource === "function"
        ? targetLayer.getSource()
        : null;

    // Si es un grupo de edición (sin fuente propia), revisar si hay dibujos asociados en sourceRef
    if (!source && targetLayer.get("isGroup") && sourceRef.current) {
      const features = sourceRef.current.getFeatures();
      if (features.length > 0) {
        let groupExtent = createEmpty();
        let foundAny = false;
        
        features.forEach((f) => {
          const props = f.getProperties();
          const rootWorkspaceId = props.workspace;
          
          let catTitle = '';
          switch(props.Categoria) {
            case 'Litologia': catTitle = 'Litología'; break;
            case 'Alteracion': catTitle = 'Alteración'; break;
            case 'Mineralizacion': catTitle = 'Mineralización'; break;
            case 'LineString': catTitle = 'Estructuras (Líneas)'; break;
            case 'Point': catTitle = 'Estructuras (Puntos)'; break;
          }

          // Pertenece a este grupo si el id coincide (root) o el titulo coincide (subgrupo)
          if (targetLayer.get("id") === rootWorkspaceId || targetLayer.get("title") === catTitle) {
            extend(groupExtent, f.getGeometry()!.getExtent());
            foundAny = true;
          }
        });

        if (foundAny) {
          mapRef.current.getView().fit(groupExtent, { duration: 1000, padding: [50, 50, 50, 50] });
          return;
        }
      }
    }

    // --- FUNCIÓN RECURSIVA PARA OBTENER EXTENT DE CUALQUIER CAPA ---
    const getLayerExtent = async (layer: any): Promise<any> => {
      if (!layer) return null;
      let ext = typeof layer.getExtent === 'function' ? layer.getExtent() : null;
      if (ext && ext.every(isFinite)) return ext;

      const src = typeof layer.getSource === 'function' ? layer.getSource() : null;
      if (src) {
        // TIFF Support
        if (layer.get('isGeoTIFF') && typeof src.getView === 'function') {
           try {
             const viewConfig = await src.getView();
             if (viewConfig && viewConfig.extent) {
                let finalExt = viewConfig.extent;
                if (viewConfig.projection && viewConfig.projection !== "EPSG:3857") {
                    const projCode = typeof viewConfig.projection.getCode === "function" ? viewConfig.projection.getCode() : viewConfig.projection;
                    finalExt = transformExtent(viewConfig.extent, projCode, "EPSG:3857");
                }
                return finalExt;
             }
           } catch(e) { console.error("Error obteniendo view del TIFF", e); }
        }

        if (typeof src.getExtent === 'function') {
           ext = src.getExtent();
           if (ext && ext.every(isFinite)) return ext;
        }
        
        // Vector Support (esperar a que tenga features si las tiene)
        if (typeof src.getFeatures === 'function') {
           const features = src.getFeatures();
           if (features.length > 0) {
             const vExt = createEmpty();
             features.forEach((f: any) => {
               if (f.getGeometry()) extend(vExt, f.getGeometry().getExtent());
             });
             if (vExt && vExt.every(isFinite)) return vExt;
           }
        }
      }

      // Group Support (ej. KMZ que devuelve un LayerGroup con imágenes y vectores)
      if (typeof layer.getLayers === 'function') {
        const subLayers = layer.getLayers().getArray();
        const groupExt = createEmpty();
        let hasExt = false;
        for (const sub of subLayers) {
           const subExt = await getLayerExtent(sub);
           if (subExt && subExt.every(isFinite)) {
             extend(groupExt, subExt);
             hasExt = true;
           }
        }
        if (hasExt) return groupExt;
      }
      return null;
    };

    const calculatedExtent = await getLayerExtent(targetLayer);
    if (calculatedExtent && calculatedExtent.every(isFinite)) {
      mapRef.current!.getView().fit(calculatedExtent, { duration: 1000, padding: [50, 50, 50, 50] });
      return;
    }

    // 2. ArcGIS Fallback
    let arcgisUrl =
      targetLayer.get("originalUrl") || targetLayer.get("url") || "";
    if (!arcgisUrl && source) {
      if (typeof source.getUrls === "function" && source.getUrls()?.length > 0)
        arcgisUrl = source.getUrls()[0];
      else if (typeof source.getUrl === "function" && source.getUrl())
        arcgisUrl = source.getUrl();
    }

    if (
      arcgisUrl &&
      typeof arcgisUrl === "string" &&
      arcgisUrl.includes("MapServer")
    ) {
      let url = arcgisUrl;
      const params =
        source && typeof source.getParams === "function"
          ? source.getParams()
          : {};
      let layerId = "0"; // Default

      if (url.endsWith("MapServer") || url.endsWith("MapServer/")) {
        if (params.LAYERS && String(params.LAYERS).startsWith("show:")) {
          layerId = String(params.LAYERS).split(":")[1];
          if (!url.endsWith("/")) url += "/";
          url = url + layerId;
        } else {
          if (!url.endsWith("/")) url += "/";
          url = url + "0"; // Try querying layer 0 as fallback
        }
      }

      const queryUrl = url + "/query?where=1=1&returnExtentOnly=true&f=pjson";
      const callbackName = "jsonp_" + Math.round(1000000 * Math.random());
      const script = document.createElement("script");
      script.src = queryUrl + "&callback=" + callbackName;

      let jsonpTimeout = setTimeout(() => {
        document.body.removeChild(script);
        delete (window as any)[callbackName];
        console.warn("JSONP Timeout - Fallback a Perú");
        const peruExtent = transformExtent(
          [-81.33, -18.35, -68.65, -0.03],
          "EPSG:4326",
          "EPSG:3857",
        );
        mapRef
          .current!.getView()
          .fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
      }, 2000);

      (window as any)[callbackName] = (data: any) => {
        clearTimeout(jsonpTimeout);
        document.body.removeChild(script);
        delete (window as any)[callbackName];

        let ext = data.extent || data.fullExtent;
        if (ext && ext.xmin !== undefined) {
          const wkid =
            ext.spatialReference?.latestWkid ||
            ext.spatialReference?.wkid ||
            4326;
          let code = "EPSG:" + wkid;
          try {
            const transformed = transformExtent(
              [ext.xmin, ext.ymin, ext.xmax, ext.ymax],
              code,
              "EPSG:3857",
            );
            if (Math.abs(ext.xmax - ext.xmin) > 30) {
              const peruExtent = transformExtent(
                [-81.33, -18.35, -68.65, -0.03],
                "EPSG:4326",
                "EPSG:3857",
              );
              mapRef
                .current!.getView()
                .fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
            } else {
              mapRef
                .current!.getView()
                .fit(transformed, {
                  duration: 1000,
                  padding: [50, 50, 50, 50],
                });
            }
          } catch (e) {
            const peruExtent = transformExtent(
              [-81.33, -18.35, -68.65, -0.03],
              "EPSG:4326",
              "EPSG:3857",
            );
            mapRef
              .current!.getView()
              .fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
          }
        } else {
          const peruExtent = transformExtent(
            [-81.33, -18.35, -68.65, -0.03],
            "EPSG:4326",
            "EPSG:3857",
          );
          mapRef
            .current!.getView()
            .fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
        }
      };

      script.onerror = () => {
        clearTimeout(jsonpTimeout);
        document.body.removeChild(script);
        delete (window as any)[callbackName];
        const peruExtent = transformExtent(
          [-81.33, -18.35, -68.65, -0.03],
          "EPSG:4326",
          "EPSG:3857",
        );
        mapRef
          .current!.getView()
          .fit(peruExtent, { duration: 1000, padding: [50, 50, 50, 50] });
      };

      document.body.appendChild(script);
      return;
    }
  };

  '''

content = content[:start_idx] + new_zoomToLayer + content[end_idx:]

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated zoomToLayer')
