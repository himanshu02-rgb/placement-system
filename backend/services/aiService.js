const { GoogleGenAI } = require('@google/genai');

let ai;
const getClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateContent = async (prompt, retries = 2) => {
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const isOverloaded = error.message?.includes('UNAVAILABLE') || error.message?.includes('503');
    if (isOverloaded && retries > 0) {
      await sleep(1000);
      return generateContent(prompt, retries - 1);
    }
    throw error;
  }
};

const parseAIJson = (text) => {
  try {
    const cleaned = text
      .trim()
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
};

module.exports = { generateContent, parseAIJson };