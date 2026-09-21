import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('          } catch (e) {\\n            console.error("Error inicializando Cesium:", e);\\n          }\\n        })\\n        .catch((err) => {\\n          console.error("No se pudo cargar ol-cesium", err);\\n        });', '          } catch (e: any) {\\n            console.error("Error inicializando Cesium:", e);\\n            ol3dErrorRef.current = String(e.message || e);\\n          }\\n        })\\n        .catch((err: any) => {\\n          console.error("No se pudo cargar ol-cesium", err);\\n          ol3dErrorRef.current = String(err.message || err);\\n        });')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
