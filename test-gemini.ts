import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  // Use gemini-2.5-flash as it supports tools
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} } as any] // hacky cast just to pass it
  });
  
  const result = await model.generateContent("Who is the property manager for 151 Regal Row Dallas TX?");
  console.log(result.response.text());
}
run();
