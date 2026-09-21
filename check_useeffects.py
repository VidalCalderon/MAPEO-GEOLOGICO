import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the first useEffect
first_idx = content.find('  useEffect(() => {\\n    const source = new VectorSource();')
if first_idx == -1:
    print("Cannot find first useEffect")

# Find the start of the second useEffect
second_idx = content.find('  useEffect(() => {\\n    if (!mapElement.current || mapRef.current) return;')
if second_idx == -1:
    print("Cannot find second useEffect")

if first_idx != -1 and second_idx != -1:
    # We want to remove the FIRST useEffect entirely. 
    # The first useEffect ends around line 430, right before updateLayersList.
    # Wait, updateLayersList is defined AFTER the first useEffect!
    
    # Let's see what is between first_idx and second_idx
    between = content[first_idx:second_idx]
    
    print("Length of between:", len(between))
