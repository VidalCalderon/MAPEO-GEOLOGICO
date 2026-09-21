export const EXCEL_COLORS: Record<string, Record<string, string>> = {
  "Estructura_Lineas": {
    "Falla": "rgba(0, 0, 255, 1.0)",
    "Venillas": "rgba(255, 165, 0, 1.0)",
    "Veta (>10cm)": "rgba(255, 0, 0, 1.0)",
    "Ledge": "rgba(0, 0, 0, 1.0)",
    "Sobreescurrimiento": "rgba(0, 0, 0, 1.0)",
    "Zona de Falla": "rgba(0, 0, 255, 1.0)",
    "Zona de Fracturamiento": "rgba(0, 0, 0, 1.0)",
    "Anticlinal": "rgba(0, 0, 0, 1.0)",
    "Sinclinal": "rgba(0, 0, 0, 1.0)",
    "Discordancia": "rgba(0, 0, 0, 1.0)",
    "Esquistosidad": "rgba(0, 0, 0, 1.0)",
    "Laminación": "rgba(0, 0, 0, 1.0)",
    "Escape de Fluidos": "rgba(0, 0, 0, 1.0)"
  },
  "Estructura_Puntos": {
    "Falla": "rgba(32, 42, 245, 1.0)",
    "Venillas": "rgba(245, 206, 32, 1.0)",
    "Veta (>10cm)": "rgba(245, 73, 39, 1.0)",
    "Ledge": "rgba(0, 0, 0, 1.0)",
    "Estrato": "rgba(0, 0, 0, 1.0)",
    "Fractura": "rgba(0, 0, 0, 1.0)",
    "Foliación": "rgba(0, 0, 0, 1.0)",
    "Flow Banding": "rgba(0, 0, 0, 1.0)",
    "Dique": "rgba(0, 0, 0, 1.0)",
    "Dextral": "rgba(0, 0, 0, 1.0)",
    "Sinestral": "rgba(0, 0, 0, 1.0)",
    "Anticlinal": "rgba(0, 0, 0, 1.0)",
    "Sinclinal": "rgba(0, 0, 0, 1.0)",
    "Anticlinal Tumbado": "rgba(0, 0, 0, 1.0)",
    "Sinclinal Tumbado": "rgba(0, 0, 0, 1.0)",
    "Buzamiento Invertido": "rgba(0, 0, 0, 1.0)",
    "Brecha": "rgba(0, 0, 0, 1.0)"
  }
};

export const CATEGORY_COLORS: Record<string, string> = {
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
