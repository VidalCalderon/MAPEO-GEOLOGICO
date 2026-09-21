with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('const zoomToLayer = (id: string) => {', 'const zoomToLayer = async (id: string) => {')
with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Made async")
