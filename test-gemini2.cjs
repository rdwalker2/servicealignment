const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
async function run() {
  const chat = model.startChat();
  const res = await chat.sendMessage('hello');
  console.log(typeof res.response.text);
  console.log(typeof res.response.functionCalls);
  console.log(Object.keys(res.response));
}
run();
