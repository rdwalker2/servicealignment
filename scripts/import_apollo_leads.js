const fs = require('fs');
const path = require('path');

// Usage: node scripts/import_apollo_leads.js <path_to_csv>
const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Please provide a path to the Apollo CSV file.");
  console.error("Usage: node scripts/import_apollo_leads.js <path_to_csv>");
  process.exit(1);
}

try {
  const content = fs.readFileSync(path.resolve(csvPath), 'utf-8');
  
  // Simple CSV parser for standard formatting
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];
    
    // Split by comma, respecting quotes
    const splitRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '"') {
          inQuotes = !inQuotes;
        } else if (row[i] === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += row[i];
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = splitRow(lines[0]).map(h => h.replace(/^"|"$/g, '').toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = splitRow(line).map(v => v.replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  const records = parseCSV(content);
  
  // Map Apollo fields to our Compass UI structure
  const opportunities = records.map((record, index) => {
    // Apollo usually has fields like: 'company', 'industry', 'website', '# employees', 'intent signal'
    const companyName = record['company'] || record['company name'] || 'Unknown Company';
    const industry = record['industry'] || 'Technology';
    
    // Create a dynamic growth signal based on employee count or just defaults
    let growthSignal = 'High Hiring Intent detected';
    if (record['# employees'] || record['employees']) {
      growthSignal += ` (${record['# employees'] || record['employees']} employees)`;
    }
    
    const url = record['website'] || record['company website'] || '#';
    
    // Generate some relevant tags
    const tags = ['High-Growth'];
    if (industry.toLowerCase().includes('software') || industry.toLowerCase().includes('saas')) {
      tags.push('SaaS');
    }
    if (industry.toLowerCase().includes('food') || industry.toLowerCase().includes('beverage') || industry.toLowerCase().includes('consumer')) {
      tags.push('CPG', 'Food/Bev');
    }

    return {
      id: index + 1,
      company: companyName,
      industry: industry,
      role: "VP / Senior Director (Target)",
      growthSignal: growthSignal,
      potentialFit: `Sourced from Apollo as a high-growth prospect for commercial leadership.`,
      url: url,
      tags: tags
    };
  });

  const outputPath = path.join(__dirname, '..', 'public', 'zach', 'data.js');
  
  const jsContent = `// Auto-generated from Apollo CSV export
export const opportunities = ${JSON.stringify(opportunities, null, 2)};
`;

  fs.writeFileSync(outputPath, jsContent);
  console.log(`Successfully imported ${opportunities.length} opportunities into public/zach/data.js!`);
  
} catch (err) {
  console.error("Error processing CSV file:", err.message);
}
