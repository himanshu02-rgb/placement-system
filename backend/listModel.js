require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const run = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const pager = await ai.models.list();

  const usable = [];
  for await (const model of pager) {
    const actions = model.supportedActions || model.supportedGenerationMethods || [];
    if (actions.includes('generateContent')) {
      usable.push(model.name);
    }
  }

  usable.forEach((name) => console.log(name));
  console.log(`\nModels that support text generation: ${usable.length}`);
};

run().catch((err) => console.log('FAIL', err.message));