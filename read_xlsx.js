import * as xlsx from 'xlsx';

try {
  const workbook = xlsx.readFile('/Users/ryan.walker/Desktop/Team Walker Pipeline-2026-07-08-12-12-17.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('First deal:', data[0]);
    console.log('Total deals in export:', data.length);
  } else {
    console.log('Export is empty.');
  }
} catch (err) {
  console.error('Error reading XLSX:', err);
}
