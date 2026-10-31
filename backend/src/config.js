/**
 * Env -> config. The only file that reads env var names.
 *
 * AI mode rule:
 *   MOCK_AI=1             -> mock (forced; demo escape hatch if the API flakes)
 *   OPENAI_API_KEY empty  -> mock (clearly labeled sample answers)
 *   otherwise             -> live (direct OpenAI, or Bedrock via OPENAI_BASE_URL)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @param {Record<string, string | undefined>} env */
export function readConfig(env) {
  const apiKey = env.OPENAI_API_KEY?.trim() ?? '';
  const ai = env.MOCK_AI?.trim() === '1' || !apiKey
    ? { mode: 'mock' }
    : {
        mode: 'live',
        apiKey,
        baseURL: (env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, ''),
        model: env.OPENAI_MODEL?.trim() || 'gpt-4o',
        timeoutMs: positiveInt(env.AI_TIMEOUT_MS, 45_000),
      };
  return Object.freeze({
    port: positiveInt(env.PORT, 3000),
    corsOrigin: env.CORS_ORIGIN?.trim() || 'http://localhost:5173',
    ai,
    ocr: { lang: 'eng', timeoutMs: positiveInt(env.OCR_TIMEOUT_MS, 45_000), cachePath: path.join(BACKEND_ROOT, '.tesseract-cache') },
  });
}

function positiveInt(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
