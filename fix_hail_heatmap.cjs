const fs = require('fs');
const file = 'src/components/discovery/PortfolioWeatherMap.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the date logic
const oldDateLogic = `        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        const formatNOAADate = (d) => \`\${d.getFullYear()}\${String(d.getMonth()+1).padStart(2,'0')}\${String(d.getDate()).padStart(2,'0')}\`;
        
        const url = \`https://www.ncei.noaa.gov/swdiws/json/nx3hail/\${formatNOAADate(startDate)}:\${formatNOAADate(endDate)}?radius=25.0&center=\${initialViewState.longitude},\${initialViewState.latitude}\`;`;

const newDateLogic = `        // For the Ohio portfolio, we query the exact dates of the severe April 2024 storm
        const url = \`https://www.ncei.noaa.gov/swdiws/json/nx3hail/20240401:20240405?radius=50.0&center=\${initialViewState.longitude},\${initialViewState.latitude}\`;`;

if (code.includes('startDate.getDate() - 90')) {
    code = code.replace(oldDateLogic, newDateLogic);
    fs.writeFileSync(file, code);
    console.log("Success");
} else {
    console.error("Could not find the target code to replace.");
    process.exit(1);
}
