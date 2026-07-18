import { runBusinessCaseAgent } from './roof-business-case-agent.js';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

async function test() {
  console.log('Testing Roof Business Case Agent...');
  try {
    const result = await runBusinessCaseAgent('123 Target Store, Dallas TX');
    console.log('\n--- Final Business Case Result ---\n');
    console.log(JSON.stringify(result.businessCase, null, 2));
    console.log('\n--- Summary ---\n');
    console.log(result.summary);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
