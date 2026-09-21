import sys

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if 'useEffect(() => {' in line and 'const source = new VectorSource();' in lines[i+1]:
        start_idx = i
        break

if start_idx == -1:
    print("Could not find the first useEffect block.")
    sys.exit(1)

# Find the end of the block
brace_count = 0
end_idx = -1
for i in range(start_idx, len(lines)):
    line = lines[i]
    brace_count += line.count('{')
    brace_count -= line.count('}')
    
    # Check if we've closed the useEffect block
    if brace_count == 0 and '}, []);' in line:
        end_idx = i
        break

if end_idx == -1:
    print("Could not find the end of the block.")
    sys.exit(1)

print(f"Removing lines from {start_idx} to {end_idx}")

del lines[start_idx:end_idx+1]

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Successfully removed the duplicated first useEffect.")
