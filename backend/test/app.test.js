import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMockModel } from '../src/ai.js';
import { fakeOcr, fakeModel, startApp, PNG_HEADER } from './helpers.js';

const REPLY = {
  simplifiedText: 'Take your medicine.',
  keyActions: [{ action: 'Take medicine', priority: 'critical', icon: 'medication' }],
  medicalTerms: [{ term: 'PO', definition: 'By mouth', category: 'instruction' }],
};

async function withApp(deps, fn) {
  const app = await startApp(deps);
  try {
    await fn(app);
  } finally {
    await app.close();
  }
}

function imageForm(buffer, field = 'image', type = 'image/png') {
  const form = new FormData();
  form.append(field, new Blob([buffer], { type }), 'photo.png');
  return form;
}

async function expectError(res, status, code) {
  assert.equal(res.status, status);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.error.code, code);
  assert.equal(typeof body.error.message, 'string');
  assert.deepEqual(Object.keys(body), ['success', 'error']);
}

test('POST /api/analyze JSON text -> 200 contract success', async () => {
  await withApp({ ocr: fakeOcr(''), ai: fakeModel(REPLY) }, async ({ url }) => {
    const res = await fetch(`${url}/api/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Take PO meds', inputType: 'text' }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { success: true, data: { originalText: 'Take PO meds', ...REPLY } });
  });
});

test('POST /api/analyze multipart image -> 200 with OCR text', async () => {
  await withApp({ ocr: fakeOcr('Follow up with PCP in 7 days'), ai: fakeModel(REPLY) }, async ({ url }) => {
    const res = await fetch(`${url}/api/analyze`, { method: 'POST', body: imageForm(PNG_HEADER) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.originalText, 'Follow up with PCP in 7 days');
  });
});

test('mock mode end to end is labeled', async () => {
  await withApp({ ocr: fakeOcr(''), ai: createMockModel() }, async ({ url }) => {
    const res = await fetch(`${url}/api/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'hello' }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.match(body.data.simplifiedText, /^DEMO MODE/);
    assert.equal(body.data.keyActions.length, 4);
  });
});

test('missing input: empty JSON, no body, bad JSON -> 400 MISSING_INPUT', async () => {
  await withApp({ ocr: fakeOcr(''), ai: fakeModel(REPLY) }, async ({ url }) => {
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), 400, 'MISSING_INPUT');
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST' }), 400, 'MISSING_INPUT');
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' }), 400, 'MISSING_INPUT');
  });
});

test('file under the wrong field name -> 400 MISSING_INPUT', async () => {
  await withApp({ ocr: fakeOcr('x'), ai: fakeModel(REPLY) }, async ({ url }) => {
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST', body: imageForm(PNG_HEADER, 'photo') }), 400, 'MISSING_INPUT');
  });
});

test('non-image upload -> 400 INVALID_IMAGE', async () => {
  await withApp({ ocr: fakeOcr('x'), ai: fakeModel(REPLY) }, async ({ url }) => {
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST', body: imageForm(Buffer.from('%PDF-1.4 not an image'), 'image', 'image/png') }), 400, 'INVALID_IMAGE');
  });
});

test('upload over 10MB -> 413 FILE_TOO_LARGE', async () => {
  await withApp({ ocr: fakeOcr('x'), ai: fakeModel(REPLY) }, async ({ url }) => {
    const big = Buffer.concat([PNG_HEADER, Buffer.alloc(10 * 1024 * 1024 + 1)]);
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST', body: imageForm(big) }), 413, 'FILE_TOO_LARGE');
  });
});

test('OCR failure -> 500 OCR_FAILED', async () => {
  await withApp({ ocr: fakeOcr(new Error('worker died')), ai: fakeModel(REPLY) }, async ({ url, logs }) => {
    await expectError(await fetch(`${url}/api/analyze`, { method: 'POST', body: imageForm(PNG_HEADER) }), 500, 'OCR_FAILED');
    assert.match(logs.join('\n'), /OCR_FAILED \(Error: worker died\)/);
  });
});

test('AI failure -> 500 AI_PROCESSING_FAILED without leaking details', async () => {
  await withApp({ ocr: fakeOcr(''), ai: fakeModel(new Error('HTTP 401 bad key sk-secret')) }, async ({ url }) => {
    const res = await fetch(`${url}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'hi there' }) });
    const text = await res.clone().text();
    assert.doesNotMatch(text, /sk-secret/);
    await expectError(res, 500, 'AI_PROCESSING_FAILED');
  });
});

test('GET /api/health', async () => {
  await withApp({ ocr: fakeOcr('', 'loading'), ai: createMockModel() }, async ({ url }) => {
    const res = await fetch(`${url}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok', services: { ocr: 'loading', ai: 'mock' } });
  });
});

test('CORS: preflight and allow-origin for the Vite dev server', async () => {
  await withApp({ ocr: fakeOcr(''), ai: fakeModel(REPLY) }, async ({ url }) => {
    const pre = await fetch(`${url}/api/analyze`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(pre.status, 204);
    assert.equal(pre.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.match(pre.headers.get('access-control-allow-headers'), /Content-Type/);
  });
});
