import { productWikiData } from './src/data/productWiki';
import * as fs from 'fs';

const products = productWikiData.filter((x: any) => x.category !== 'integrations');
const integrations = productWikiData.filter((x: any) => x.category === 'integrations');

const createTsContent = (varName: string, data: any) => {
  // We need to preserve the WikiFeature interface at the top of productWiki.ts
  const interfaceStr = `export interface WikiFeature {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  status: 'verified' | 'needs-review' | 'unverified';
  whatItDoes?: string;
  howItWorks?: string;
  whatNotToSay?: string;
  doNotSay?: string[]; // CS wiki format
  supportDoc?: string;
  supportDocUrl?: string;
  apiEndpoint?: string;
  apiNotes?: string;
  tags?: string[];
  lastVerified?: string;
  verifiedBy?: string;
  implementationNotes?: string;
  prospectQA?: { q: string; a: string }[];
  plans?: string[];
  addOn?: boolean;
  searchAliases?: string[];
}

`;
  
  const header = varName === 'productWikiData' 
    ? interfaceStr
    : `import type { WikiFeature } from './productWiki';\n\n`;

  return header + 'export const ' + varName + ': WikiFeature[] = ' + JSON.stringify(data, null, 2) + ';';
};

fs.writeFileSync('./src/data/productWiki.ts', createTsContent('productWikiData', products));
fs.writeFileSync('./src/data/integrationsWiki.ts', createTsContent('integrationsWikiData', integrations));
