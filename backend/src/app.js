/**
 * Thin HTTP shell. Knows Express, multer, body-parser error shapes, and CORS.
 * Knows nothing about OCR, prompts, or the response schema beyond `{ success: true, data }`.
 * Takes deps by injection so tests run with fakes and never load tesseract.js or the network.
 */
import express from 'express';
import multer from 'multer';
import { analyzeDocument, toErrorResponse, healthReport, AnalyzeError, MAX_IMAGE_BYTES } from './analyze.js';
import { identifyPill } from './identify.js';

/**
 * @param {import('./analyze.js').Deps & { vision?: import('./identify.js').VisionPort }} deps
 * @param {{ corsOrigin: string, log?: (line: string) => void }} options
 */
export function createApp(deps, { corsOrigin, log = console.error }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors(corsOrigin));

  app.get('/api/health', (req, res) => {
    res.json(healthReport(deps));
  });

  app.post('/api/analyze', parseJson, parseUpload, async (req, res) => {
    const data = await analyzeDocument({ image: req.file ?? null, text: req.body?.text }, deps);
    res.json({ success: true, data });
  });

  app.post('/api/identify', parseUpload, async (req, res) => {
    if (!deps.vision) throw new AnalyzeError('AI_PROCESSING_FAILED', { cause: new Error('no vision model wired') });
    const data = await identifyPill({ image: req.file ?? null }, { vision: deps.vision });
    res.json({ success: true, data });
  });

  // Express 5 forwards async rejections here.
  app.use((err, req, res, next) => {
    const { status, body } = toErrorResponse(err);
    // Never log document text, headers, or keys.
    const cause = err?.cause ?? (err instanceof AnalyzeError ? null : err);
    log(`${req.method} ${req.path} -> ${status} ${body.error.code}${cause ? ` (${cause.name ?? 'Error'}: ${String(cause.message ?? cause).slice(0, 200)})` : ''}`);
    res.status(status).json(body);
  });

  return app;
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });
const singleImage = upload.single('image');
const jsonParser = express.json({ limit: '1mb' });

/** multipart -> req.file / req.body, with multer errors translated to contract codes. */
function parseUpload(req, res, next) {
  singleImage(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(new AnalyzeError('FILE_TOO_LARGE', { cause: err }));
      if (err.code === 'LIMIT_UNEXPECTED_FILE') return next(new AnalyzeError('MISSING_INPUT', { cause: err })); // wrong field name
    }
    return next(new AnalyzeError('INVALID_IMAGE', { cause: err })); // malformed multipart, too many files, ...
  });
}

/** application/json -> req.body, with body-parser errors translated to contract codes. */
function parseJson(req, res, next) {
  jsonParser(req, res, (err) => {
    if (!err) return next();
    if (err.type === 'entity.too.large') return next(new AnalyzeError('FILE_TOO_LARGE', { cause: err }));
    return next(new AnalyzeError('MISSING_INPUT', { cause: err })); // bad JSON
  });
}

/** Minimal CORS for the Vite dev server, including preflight. */
function cors(origin) {
  return (req, res, next) => {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      return res.sendStatus(204);
    }
    next();
  };
}
