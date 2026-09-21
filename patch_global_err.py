import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = 'const MapComponent = () => {'

banner_code = '''
  useEffect(() => {
    const handleErr = (e: any) => alert("GLOBAL ERROR: " + (e.message || e.reason || e));
    window.addEventListener("error", handleErr);
    window.addEventListener("unhandledrejection", handleErr);
    return () => {
      window.removeEventListener("error", handleErr);
      window.removeEventListener("unhandledrejection", handleErr);
    };
  }, []);
'''

idx = content.find(start_str)
if idx != -1:
    content = content[:idx + len(start_str)] + '\\n' + banner_code + content[idx + len(start_str):]
    with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
