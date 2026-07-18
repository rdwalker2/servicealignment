const fs = require('fs');
const file = 'src/components/discovery/BusinessCaseDocument.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
const importStatement = "import { NwsPrecipitationForecast } from './NwsPrecipitationForecast';\n";
if (!code.includes('NwsPrecipitationForecast')) {
    code = code.replace("import { RoofHealthSection }", importStatement + "import { RoofHealthSection }");
}

// Inject component before Historical Timeline
const target = "{/* Historical Timeline */}";
if (code.includes(target) && !code.includes('<NwsPrecipitationForecast')) {
    const coordsStr = `
                    {item.property.coordinates && item.property.coordinates.coordinates && (
                       <NwsPrecipitationForecast 
                         lat={item.property.coordinates.coordinates[1]} 
                         lon={item.property.coordinates.coordinates[0]} 
                       />
                    )}
                    `;
    code = code.replace(target, coordsStr + "\n                    " + target);
}

fs.writeFileSync(file, code);
