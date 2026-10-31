/**
 * Tesseract.js OCR port: one long-lived worker, lazily created, self-healing.
 *
 *   idle --getWorker()--> loading --ok--> ready --job timeout/crash--> (terminate) idle
 *                            \--init error--> error --next call retries--^
 *
 * Invariants:
 *  - At most one worker. Concurrent callers share one `workerPromise` (no double download).
 *  - A failed init or failed job clears `workerPromise`, so the next request starts fresh.
 *  - Worker errors go to `errorHandler` so a corrupt image can't crash the process.
 *  - Language data is cached in backend/.tesseract-cache (gitignored); network needed on first run only.
 */
import { mkdirSync } from 'node:fs';
import { createWorker } from 'tesseract.js';

/**
 * @param {{ lang: string, timeoutMs: number, cachePath: string }} config
 * @returns {import('./analyze.js').OcrPort & { warm(): void, close(): Promise<void> }}
 */
export function createTesseractOcr(config) {
  let workerPromise = null;
  let state = 'idle';
  // tesseract.js silently skips caching if the folder is missing, then re-downloads every start.
  mkdirSync(config.cachePath, { recursive: true });

  function getWorker() {
    if (!workerPromise) {
      state = 'loading';
      workerPromise = createWorker(config.lang, 1, {
        cachePath: config.cachePath,
        errorHandler: (err) => console.error('[ocr] worker error:', err?.message ?? err),
      }).then(
        (worker) => {
          state = 'ready';
          return worker;
        },
        (err) => {
          state = 'error';
          workerPromise = null;
          throw err;
        },
      );
    }
    return workerPromise;
  }

  async function reset() {
    const pending = workerPromise;
    workerPromise = null;
    state = 'idle';
    try {
      (await pending)?.terminate();
    } catch {
      // already dead
    }
  }

  function warm() {
    getWorker().catch((err) => console.error('[ocr] warm-up failed (will retry on first upload):', err?.message ?? err));
  }

  return {
    async recognize(image) {
      const worker = await withTimeout(getWorker(), config.timeoutMs, 'OCR init timed out');
      try {
        const { data } = await withTimeout(worker.recognize(image), config.timeoutMs, 'OCR timed out');
        return data.text ?? '';
      } catch (err) {
        await reset(); // a stuck or poisoned worker never serves the next request
        warm();
        throw err;
      }
    },
    status() {
      return state === 'ready' ? 'ready' : state === 'error' ? 'error' : 'loading';
    },
    warm,
    close: reset,
  };
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error(message), { name: 'TimeoutError' })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
