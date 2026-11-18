require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const models = [
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
];

const run = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (const model of models) {
    const start = Date.now();
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Reply with the single word: ready',
        config: { maxOutputTokens: 20 },
      });
      const seconds = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`OK    ${model} (${seconds}s): ${response.text}`);
    } catch (err) {
      console.log(`FAIL  ${model}: ${err.message.slice(0, 120)}`);
    }
  }
};

run();