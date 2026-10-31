// Composition root: the only file that wires real adapters and calls listen().
import { readConfig } from './config.js';
import { createApp } from './app.js';
import { createOpenAiModel, createMockModel, createBedrockVisionModel, createMockVisionModel } from './ai.js';
import { createTesseractOcr } from './ocr.js';

const config = readConfig(process.env);
const ai = config.ai.mode === 'live' ? createOpenAiModel(config.ai) : createMockModel();
const vision = config.vision.mode === 'live' ? createBedrockVisionModel(config.vision) : createMockVisionModel();
const ocr = createTesseractOcr(config.ocr);

const app = createApp({ ocr, ai, vision }, { corsOrigin: config.corsOrigin });

app.listen(config.port, () => {
  console.log(`HealthLens backend on http://localhost:${config.port}/api`);
  if (config.ai.mode === 'live') {
    console.log(`AI: LIVE, model ${config.ai.model} via ${new URL(config.ai.baseURL).host}`); // host only, never the key
  } else {
    console.warn('AI: DEMO MODE (no OPENAI_API_KEY, or MOCK_AI=1). Every answer is the labeled sample response.');
  }
  if (config.vision.mode === 'live') {
    console.log(`Vision (pill ID): LIVE, model ${config.vision.model} via ${new URL(config.vision.runtimeURL).host}`);
  } else {
    console.warn('Vision (pill ID): DEMO MODE. Every pill answer is the labeled sample response.');
  }
  console.log('OCR: loading Tesseract (first run downloads English data, needs internet once)...');
  ocr.warm();
});

process.on('unhandledRejection', (err) => console.error('[server] unhandled rejection:', err?.message ?? err));
