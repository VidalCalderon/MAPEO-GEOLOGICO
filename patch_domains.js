const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

const DOMAINS = {
  Puntos_TIPO: ['Falla', 'Venillas', 'Veta (>10cm)', 'Ledge', 'Estrato', 'Fractura', 'Foliación', 'Flow Banding', 'Dique', 'Dextral', 'Sinestral', 'Anticlinal', 'Sinclinal', 'Anticlinal Tumbado', 'Sinclinal Tumbado', 'Buzamiento Invertido', 'Brecha'],
  Lineas_TIPO: ['Falla', 'Venillas', 'Veta (>10cm)', 'Ledge', 'Sobreescurrimiento', 'Zona de Falla', 'Zona de Fracturamiento', 'Anticlinal', 'Sinclinal', 'Discordancia', 'Esquistosidad', 'Laminación', 'Escape de Fluidos'],
  Lineas_SUBTIPO: ['Venillas (<10cm)', 'Venilla A', 'Venilla B', 'Venilla C', 'Venilla D', 'Venilla EB', 'Venilla EDM', 'Venilla M', 'Stockwork', 'Craquelamiento', 'Diaclasas', 'Fracturas', 'Zona de Cizalla'],
  Lineas_TEXTURA: ['Brechada', 'Shear Zone', 'Masiva', 'Bitumen', 'Bandeada', 'Crustiforme', 'Ebullición', 'Coloforme', 'Indiferenciado', 'Stockwork', 'Foliada', 'Planar', 'Cruzada'],
  Litologia_TIPO: ['Subvolcánico', 'Intrusivo', 'Volcánico Coherente', 'Volcánico Fragmental', 'Volcanoclástico', 'Brecha', 'Vitreo', 'Sedimentario', 'Metamórfico', 'Cuaternario', 'Obliterado'],
  Litologia_TEXTURA: ['Afanítico', 'Fanerítico', 'Porfirítico', 'Indiferenciado', 'Brechado', 'Autobrecha', 'Patchy Agusanada', 'Aglomerado', 'Bloques', 'Bandeado', 'Cristales', 'Cuarzo', 'Biotita', 'Sulfuros', 'Arenisca', 'Caliza', 'Lutita', 'Riolita', 'Dacita', 'Andesita', 'Eutaxítica', 'Soldada', 'Pumicea', 'Esferulítica', 'Vitreo', 'Vesicular', 'Vitriocristal', 'Piroclástica', 'Matriz Soportada', 'Clasto Soportada', 'Cemento Soportada', 'Craquelada', 'Mudstone', 'Wackstone', 'Packstone', 'Grainstone', 'Bindstone', 'Cristalina', 'Fino', 'Medio', 'Grueso', 'Micritico', 'Homogéneo', 'Grano Fino', 'Grano Medio', 'Grano Grueso', 'Migmatita', 'Granoblástica', 'Clástico', 'Conglomeradico', 'Eolico']
};

c = c.replace(
  /<select name="TIPO" onChange=\{handleChange\} className="w-full border border-gray-300 rounded p-2">\s*<option value="">Seleccione...<\/option>\s*<option value="Falla">Falla<\/option>\s*<option value="Venillas">Venillas<\/option>\s*<option value="Veta \(>10cm\)">Veta \(>10cm\)<\/option>\s*<option value="Estrato">Estrato<\/option>\s*<option value="Fractura">Fractura<\/option>\s*<option value="Foliacion">Foliación<\/option>\s*<option value="Dique">Dique<\/option>\s*<\/select>/,
  '<select name="TIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2"><option value="">Seleccione...</option>' + DOMAINS.Puntos_TIPO.map(x => '<option value="'+x+'">'+x+'</option>').join('') + '</select>'
);

c = c.replace(
  /<select name="TIPO" onChange=\{handleChange\} className="w-full border border-gray-300 rounded p-2">\s*<option value="">Seleccione...<\/option>\s*<option value="Falla">Falla<\/option>\s*<option value="Venillas">Venillas<\/option>\s*<option value="Veta \(>10cm\)">Veta \(>10cm\)<\/option>\s*<\/select>/,
  '<select name="TIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2"><option value="">Seleccione...</option>' + DOMAINS.Lineas_TIPO.map(x => '<option value="'+x+'">'+x+'</option>').join('') + '</select>'
);

c = c.replace(
  /<select name="SUBTIPO" onChange=\{handleChange\} className="w-full border border-gray-300 rounded p-2">\s*<option value="">Seleccione...<\/option>\s*<option value="Normal">Normal<\/option>\s*<option value="Inversa">Inversa<\/option>\s*<option value="Transcurrente">Transcurrente<\/option>\s*<\/select>/,
  '<select name="SUBTIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2"><option value="">Seleccione...</option>' + DOMAINS.Lineas_SUBTIPO.map(x => '<option value="'+x+'">'+x+'</option>').join('') + '</select>'
);

c = c.replace(
  /<select name="TEXTURA" onChange=\{handleChange\} className="w-full border border-gray-300 rounded p-2">\s*<option value="">Seleccione...<\/option>\s*<option value="Masiva">Masiva<\/option>\s*<option value="Bandeada">Bandeada<\/option>\s*<option value="Brechada">Brechada<\/option>\s*<\/select>/,
  '<select name="TEXTURA" onChange={handleChange} className="w-full border border-gray-300 rounded p-2"><option value="">Seleccione...</option>' + DOMAINS.Lineas_TEXTURA.map(x => '<option value="'+x+'">'+x+'</option>').join('') + '</select>'
);

c = c.replace(
  /<select name="TIPO" onChange=\{handleChange\} className="w-full border border-gray-300 rounded p-2">\s*<option value="">Seleccione...<\/option>\s*<option value="Volcanico">Volcánico<\/option>\s*<option value="Intrusivo">Intrusivo<\/option>\s*<option value="Sedimentario">Sedimentario<\/option>\s*<\/select>/,
  '<select name="TIPO" onChange={handleChange} className="w-full border border-gray-300 rounded p-2"><option value="">Seleccione...</option>' + DOMAINS.Litologia_TIPO.map(x => '<option value="'+x+'">'+x+'</option>').join('') + '</select>'
);

c = c.replace(
  /<select name="TEXTURA" onChange=\{handleChange\} className="w-full border border-gray-300 rounded p-2">\s*<option value="">Seleccione...<\/option>\s*<option value="Porfirica">Porfírica<\/option>\s*<option value="Afanitica">Afanítica<\/option>\s*<option value="Granular">Granular<\/option>\s*<\/select>/,
  '<select name="TEXTURA" onChange={handleChange} className="w-full border border-gray-300 rounded p-2"><option value="">Seleccione...</option>' + DOMAINS.Litologia_TEXTURA.map(x => '<option value="'+x+'">'+x+'</option>').join('') + '</select>'
);

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
