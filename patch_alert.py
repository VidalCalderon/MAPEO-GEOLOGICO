with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('          } catch (e) {\\n            console.error("Error inicializando Cesium:", e);\\n          }', '          } catch (e: any) {\\n            console.error("Error inicializando Cesium:", e);\\n            alert("Error Cesium: " + (e.message || e));\\n          }')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
