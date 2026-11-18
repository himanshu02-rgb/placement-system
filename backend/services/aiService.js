const { GoogleGenAI } = require('@google/genai');

// Models are tried in this order. If one fails, the next one is used.
const MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest'];

const REQUEST_TIMEOUT_MS = 25000; // stop waiting after 25 seconds per attempt
const MAX_ATTEMPTS_PER_MODEL = 2; // one try plus one retry for busy errors
const RETRY_DELAY_MS = 3000;

let ai;
const getClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Rejects if the promise takes longer than ms.
const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('TIMEOUT');
      err.code = 'TIMEOUT';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const isBusyError = (msg) =>
  msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
const isQuotaError = (msg) => msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');

// Turns internal errors into messages a student or recruiter can understand.
const friendlyError = (error) => {
  const msg = String(error?.message || error || '');
  let text;
  if (error?.code === 'TIMEOUT') {
    text = 'The AI took too long to respond. Please try again.';
  } else if (isQuotaError(msg)) {
    text = 'The AI daily limit has been reached. Please try again later.';
  } else {
    text = 'The AI service is busy right now. Please try again in a few minutes.';
  }
  const err = new Error(text);
  err.status = 503;
  return err;
};

// Sends a prompt and returns the reply text.
const generateContent = async (prompt) => {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const response = await withTimeout(
          getClient().models.generateContent({
            model,
            contents: prompt,
            config: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
          REQUEST_TIMEOUT_MS
        );

        const text = response.text;
        if (!text) {
          throw new Error('EMPTY_RESPONSE');
        }

        console.log(`AI answered from ${model}`);
        return text;
      } catch (error) {
        lastError = error;
        const msg = String(error?.message || error);
        console.log(`AI ${model} attempt ${attempt} failed: ${msg.slice(0, 150)}`);

        if (isBusyError(msg) && attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(RETRY_DELAY_MS);
          continue; // retry the same model once
        }
        break; // move on to the next model
      }
    }
  }

  throw friendlyError(lastError);
};

// Removes ```json fences if the model adds them, then parses the JSON.
// Returns null if the text is not valid JSON.
const parseAIJson = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
};

module.exports = { generateContent, parseAIJson };