import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identifyPill } from '../src/identify.js';
import { createBedrockVisionModel, createMockVisionModel } from '../src/ai.js';
import { readConfig } from '../src/config.js';
import { fakeOcr, fakeModel, startApp, PNG_HEADER, JPEG_HEADER } from './helpers.js';

const BOTTLE = {
  kind: 'bottle',
  medicationName: 'Lisinopril',
  strength: '10 mg',
  purpose: 'Lowers blood pressure.',
  howToTake: 'Take 1 pill every morning.',
  appearance: 'Orange bottle.',
  imprint: '',
  warnings: ['May cause dizziness.'],
  confidence: 'high',
  summary: 'This is lisinopril.',
};

function fakeVision(replyOrError, mode = 'live') {
  return {
    mode,
    calls: [],
    async see(prompt) {
      this.calls.push(prompt);
      if (replyOrError instanceof Error) throw replyOrError;
      return typeof replyOrError === 'string' ? replyOrError : JSON.stringify(replyOrError);
    },
  };
}

const png = { buffer: PNG_HEADER };

test('identifyPill: bottle passes through all fields', async () => {
  const vision = fakeVision(BOTTLE);
  const out = await identifyPill({ image: png }, { vision });
  assert.deepEqual(out, { identified: true, ...BOTTLE });
  assert.equal(vision.calls[0].image.format, 'png');
  assert.equal((await identifyPill({ image: { buffer: JPEG_HEADER } }, { vision })).kind, 'bottle');
  assert.equal(vision.calls[1].image.format, 'jpeg');
});

test('identifyPill: loose pill is never "high" confidence', async () => {
  const out = await identifyPill({ image: png }, { vision: fakeVision({ ...BOTTLE, kind: 'pill', imprint: 'L 10' }) });
  assert.equal(out.confidence, 'medium');
  assert.equal(out.identified, true);
});

test('identifyPill: no name -> not identified, low confidence, no dosing fields', async () => {
  const out = await identifyPill(
    { image: png },
    { vision: fakeVision({ ...BOTTLE, kind: 'pill', medicationName: '', confidence: 'high', howToTake: 'Take 2' }) },
  );
  assert.equal(out.identified, false);
  assert.equal(out.confidence, 'low');
  assert.equal(out.howToTake, '');
  assert.deepEqual(out.warnings, []);
  assert.equal(out.summary, 'This is lisinopril.');
});

test('identifyPill: unknown kind -> not identified even with a name', async () => {
  const out = await identifyPill({ image: png }, { vision: fakeVision({ ...BOTTLE, kind: 'cat' }) });
  assert.equal(out.kind, 'unknown');
  assert.equal(out.identified, false);
});

test('identifyPill: tolerates fenced JSON; rejects garbage and missing summary', async () => {
  const fenced = '```json\n' + JSON.stringify(BOTTLE) + '\n```';
  assert.equal((await identifyPill({ image: png }, { vision: fakeVision(fenced) })).medicationName, 'Lisinopril');
  await assert.rejects(identifyPill({ image: png }, { vision: fakeVision('not json') }), { code: 'AI_PROCESSING_FAILED' });
  await assert.rejects(identifyPill({ image: png }, { vision: fakeVision({ ...BOTTLE, summary: '' }) }), { code: 'AI_PROCESSING_FAILED' });
});

test('identifyPill: input errors use the shared contract codes', async () => {
  const vision = fakeVision(BOTTLE);
  await assert.rejects(identifyPill({ image: null }, { vision }), { code: 'MISSING_INPUT' });
  await assert.rejects(identifyPill({ image: { buffer: Buffer.from('GIF89a....') } }, { vision }), { code: 'INVALID_IMAGE' });
  await assert.rejects(identifyPill({ image: png }, { vision: fakeVision(new Error('boom')) }), { code: 'AI_PROCESSING_FAILED' });
});

test('mock vision is labeled DEMO MODE', async () => {
  const out = await identifyPill({ image: png }, { vision: createMockVisionModel() });
  assert.match(out.summary, /^DEMO MODE/);
});

test('bedrock vision adapter sends a Converse request with the image', async () => {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ output: { message: { content: [{ text: '{"a":' }, { text: '1}' }] } } }), { status: 200 });
  };
  const cfg = { apiKey: 'br-key', runtimeURL: 'https://bedrock-runtime.test', model: 'us.anthropic.claude-sonnet-5-5', timeoutMs: 1000 };
  const out = await createBedrockVisionModel(cfg, { fetch }).see({ system: 'S', user: 'U', image: { buffer: PNG_HEADER, format: 'png' } });
  assert.equal(out, '{"a":1}');
  assert.equal(calls[0].url, 'https://bedrock-runtime.test/model/us.anthropic.claude-sonnet-5-5/converse');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer br-key');
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.system, [{ text: 'S' }]);
  assert.equal(body.messages[0].content[0].image.source.bytes, PNG_HEADER.toString('base64'));

  const failing = async () => new Response('denied', { status: 403 });
  await assert.rejects(createBedrockVisionModel(cfg, { fetch: failing }).see({ system: '', user: '', image: { buffer: PNG_HEADER, format: 'png' } }), (err) => {
    assert.match(err.message, /Vision HTTP 403/);
    assert.doesNotMatch(err.message, /br-key/);
    return true;
  });
});

test('readConfig vision: reuses Bedrock OPENAI_* settings, explicit vars win, MOCK_AI forces mock', () => {
  assert.equal(readConfig({}).vision.mode, 'mock');
  assert.equal(readConfig({ OPENAI_API_KEY: 'sk', OPENAI_BASE_URL: 'https://api.openai.com/v1' }).vision.mode, 'mock');
  const bedrock = { OPENAI_API_KEY: 'br', OPENAI_BASE_URL: 'https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1' };
  assert.deepEqual(readConfig(bedrock).vision, {
    mode: 'live', apiKey: 'br', runtimeURL: 'https://bedrock-runtime.us-east-1.amazonaws.com', model: 'us.anthropic.claude-sonnet-5-5', timeoutMs: 45000,
  });
  assert.equal(readConfig({ ...bedrock, MOCK_AI: '1' }).vision.mode, 'mock');
  const explicit = readConfig({ BEDROCK_RUNTIME_URL: 'https://x.test/', BEDROCK_API_KEY: 'k', VISION_MODEL: 'm' }).vision;
  assert.deepEqual(explicit, { mode: 'live', apiKey: 'k', runtimeURL: 'https://x.test', model: 'm', timeoutMs: 45000 });
});

test('POST /api/identify: 200 success and contract errors over HTTP', async () => {
  const app = await startApp({ ocr: fakeOcr(''), ai: fakeModel({}), vision: fakeVision(BOTTLE) });
  try {
    const form = new FormData();
    form.append('image', new Blob([PNG_HEADER], { type: 'image/png' }), 'pill.png');
    const ok = await fetch(`${app.url}/api/identify`, { method: 'POST', body: form });
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { success: true, data: { identified: true, ...BOTTLE } });

    const missing = await fetch(`${app.url}/api/identify`, { method: 'POST', body: new FormData() });
    assert.equal(missing.status, 400);
    assert.equal((await missing.json()).error.code, 'MISSING_INPUT');

    const bad = new FormData();
    bad.append('image', new Blob([Buffer.from('%PDF-1.4')], { type: 'image/png' }), 'x.png');
    const invalid = await fetch(`${app.url}/api/identify`, { method: 'POST', body: bad });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error.code, 'INVALID_IMAGE');
  } finally {
    await app.close();
  }
});
