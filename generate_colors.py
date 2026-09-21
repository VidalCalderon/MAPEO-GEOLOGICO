import pandas as pd
import json

df_dict = pd.read_excel('D:/MAPEO-GEOLOGICO/Tablas y Trigger_v13/Dom_Geodatabase_BNV_v13.xls', sheet_name=None)

category_colors = {}

for sheet_name, df in df_dict.items():
    if sheet_name not in ['Litologia', 'Alteracion', 'Estructura_Lineas', 'Mineralizacion', 'Estructura_Puntos']:
        continue
    
    col_to_check = 'MINERAL_1' if sheet_name == 'Alteracion' else 'TIPO'
    
    if col_to_check not in df.columns:
        continue
        
    color_map = {}
    opacity = '0.6' if sheet_name in ['Litologia', 'Alteracion', 'Mineralizacion'] else '1.0'
    for idx, row in df.iterrows():
        val = row[col_to_check]
        if pd.isna(val):
            continue
        val_str = str(val).strip()
        if not val_str:
            continue
            
        if 'COLOR-R' in df.columns and 'COLOR-G' in df.columns and 'COLOR-B' in df.columns:
            r = row['COLOR-R']
            g = row['COLOR-G']
            b = row['COLOR-B']
            
            if pd.isna(r) or pd.isna(g) or pd.isna(b):
                continue
                
            color_map[val_str] = f"rgba({int(r)}, {int(g)}, {int(b)}, {opacity})"
    
    if color_map:
        category_colors[sheet_name] = color_map

with open('frontend/src/utils/colors.ts', 'w', encoding='utf-8') as f:
    f.write('export const EXCEL_COLORS: Record<string, Record<string, string>> = ')
    json.dump(category_colors, f, indent=2, ensure_ascii=False)
    f.write(';\n\n')
    
    f.write('''export const CATEGORY_COLORS: Record<string, string> = {
  "Litologia": "rgba(150, 150, 150, 0.6)",
  "Alteracion": "rgba(200, 150, 200, 0.6)",
  "Mineralizacion": "rgba(200, 200, 150, 0.6)",
  "Estructura_Lineas": "rgba(50, 50, 255, 1.0)",
  "Estructura_Puntos": "rgba(255, 50, 50, 1.0)",
  "Point": "rgba(255, 50, 50, 1.0)",
  "LineString": "rgba(50, 50, 255, 1.0)",
};

export const getFeatureColor = (properties: any) => {
  let cat = properties.Categoria;
  
  if (cat === 'LineString') {
    cat = 'Estructura_Lineas';
  } else if (cat === 'Point') {
    cat = 'Estructura_Puntos';
  }
  
  if (cat && EXCEL_COLORS[cat]) {
    const val = cat === "Alteracion" ? properties.MINERAL_1 : properties.TIPO;
    if (val && EXCEL_COLORS[cat][val]) {
      return EXCEL_COLORS[cat][val];
    }
  }
  
  if (properties.Categoria && CATEGORY_COLORS[properties.Categoria]) {
    return CATEGORY_COLORS[properties.Categoria];
  }

  return "rgba(255, 100, 50, 0.4)";
};
''')

print("Generated colors.ts")
