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
    vision: readVisionConfig(env),
    ocr: { lang: 'eng', timeoutMs: positiveInt(env.OCR_TIMEOUT_MS, 45_000), cachePath: path.join(BACKEND_ROOT, '.tesseract-cache') },
  });
}

/**
 * Vision (pill identification) mode rule:
 *   MOCK_AI=1                                   -> mock
 *   BEDROCK_RUNTIME_URL + BEDROCK_API_KEY set   -> live
 *   else OPENAI_BASE_URL is a bedrock-runtime URL with OPENAI_API_KEY -> live, same host and key
 *   otherwise                                   -> mock
 */
function readVisionConfig(env) {
  const forcedMock = env.MOCK_AI?.trim() === '1';
  let runtimeURL = env.BEDROCK_RUNTIME_URL?.trim() ?? '';
  let apiKey = env.BEDROCK_API_KEY?.trim() ?? '';
  if (!runtimeURL || !apiKey) {
    const host = safeHost(env.OPENAI_BASE_URL?.trim());
    if (host?.startsWith('bedrock-runtime.')) {
      runtimeURL ||= `https://${host}`;
      apiKey ||= env.OPENAI_API_KEY?.trim() ?? '';
    }
  }
  if (forcedMock || !runtimeURL || !apiKey) return { mode: 'mock' };
  return {
    mode: 'live',
    apiKey,
    runtimeURL: runtimeURL.replace(/\/+$/, ''),
    model: env.VISION_MODEL?.trim() || 'us.anthropic.claude-sonnet-5-5',
    timeoutMs: positiveInt(env.AI_TIMEOUT_MS, 45_000),
  };
}

function safeHost(url) {
  try {
    return url ? new URL(url).host : null;
  } catch {
    return null;
  }
}

function positiveInt(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
