import pandas as pd
import json

excel = pd.ExcelFile('D:/MAPEO-GEOLOGICO/Tablas y Trigger_v13/Dom_Geodatabase_BNV_v13.xls')
sheet_map = {
    'Litologia_Polygono': 'Litologia',
    'Alteración_Poligono': 'Alteracion',
    'Mineralización_Poligono': 'Mineralizacion'
}

polygon_rules = {}

for sheet_name in excel.sheet_names:
    if sheet_name not in sheet_map: continue
    cat_name = sheet_map[sheet_name]
    df = pd.read_excel(excel, sheet_name=sheet_name)
    
    cat_rules = {}
    tipos = [x for x in df['TIPO'].dropna().unique() if str(x).strip()]
    
    # Target columns to extract
    target_cols = [c for c in df.columns if not c.startswith('Cod') and not c.startswith('Dom') and not c.startswith('COLOR') and c not in ['TIPO', 'GEOLOGO', 'DESCRIPCION', 'GEOINTERP']]
    
    for tipo in tipos:
        tipo_str = str(tipo).strip()
        tipo_rules = {}
        
        # for Alteracion and Mineralizacion, all rows define the domains globally, not per TIPO necessarily,
        # but just in case, we can grab all unique values for these columns from the entire sheet or just for this TIPO.
        # Actually, in these tables, the domain lists are often written in the first few rows regardless of TIPO, or they have empty TIPO.
        # So we should just grab all unique non-null values in the entire sheet for these columns!
        
        for col in target_cols:
            if cat_name == 'Alteracion' and tipo_str.startswith('Sin '):
                # Don't add fields for 'Sin Alteracion'
                continue
            if cat_name == 'Mineralizacion' and tipo_str.startswith('Sin '):
                # Don't add fields for 'Sin Mineralizacion'
                continue
                
            # Grab all unique values in this column across the whole sheet, as the Excel might list them arbitrarily
            vals = [str(x).strip() for x in df[col].dropna().unique() if str(x).strip()]
            if vals:
                tipo_rules[col] = vals
                
        cat_rules[tipo_str] = tipo_rules
        
    polygon_rules[cat_name] = cat_rules

with open('frontend/src/utils/formRules.ts', 'w', encoding='utf-8') as f:
    f.write('export const POLYGON_RULES: Record<string, Record<string, Record<string, string[]>>> = ')
    json.dump(polygon_rules, f, ensure_ascii=False)
    f.write(';\n')

print("Generated formRules.ts")
