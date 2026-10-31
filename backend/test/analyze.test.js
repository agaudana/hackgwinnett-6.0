import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDocument, toErrorResponse, healthReport, AnalyzeError, MAX_IMAGE_BYTES } from '../src/analyze.js';
import { createMockModel, MOCK_LABEL } from '../src/ai.js';
import { fakeOcr, fakeModel, PNG_HEADER, JPEG_HEADER } from './helpers.js';

const GOOD_REPLY = {
  simplifiedText: 'Take your antibiotic twice a day.',
  keyActions: [{ action: 'Take amoxicillin twice a day', priority: 'critical', icon: 'medication' }],
  medicalTerms: [{ term: 'PO BID', definition: 'By mouth, two times a day', category: 'instruction' }],
};
const DOC = 'Patient should take amoxicillin 500mg PO BID with food.';

test('text input: returns contract shape with originalText from the input', async () => {
  const data = await analyzeDocument({ text: `  ${DOC}  ` }, { ocr: fakeOcr('unused'), ai: fakeModel(GOOD_REPLY) });
  assert.deepEqual(data, { originalText: DOC, ...GOOD_REPLY });
});

test('model cannot overwrite originalText', async () => {
  const data = await analyzeDocument({ text: DOC }, { ocr: fakeOcr(''), ai: fakeModel({ ...GOOD_REPLY, originalText: 'HACKED' }) });
  assert.equal(data.originalText, DOC);
});

test('image input: OCR text becomes originalText and is sent to the model', async () => {
  const ocr = fakeOcr('  Return to ED if SOB worsens.  ');
  const ai = fakeModel(GOOD_REPLY);
  const data = await analyzeDocument({ image: { buffer: PNG_HEADER }, text: 'ignored' }, { ocr, ai });
  assert.equal(data.originalText, 'Return to ED if SOB worsens.');
  assert.match(ai.prompts[0].user, /Return to ED if SOB worsens/);
  assert.equal(ocr.calls, 1);
});

test('JPEG magic bytes accepted', async () => {
  const data = await analyzeDocument({ image: { buffer: JPEG_HEADER } }, { ocr: fakeOcr('Take medicine every day please'), ai: fakeModel(GOOD_REPLY) });
  assert.equal(data.originalText, 'Take medicine every day please');
});

test('missing input variants -> MISSING_INPUT', async () => {
  const deps = { ocr: fakeOcr(''), ai: fakeModel(GOOD_REPLY) };
  for (const input of [{}, { text: '' }, { text: '   ' }, { text: 42 }, { image: null }, { image: { buffer: Buffer.alloc(0) } }]) {
    await assert.rejects(analyzeDocument(input, deps), { code: 'MISSING_INPUT' }, JSON.stringify(input));
  }
});

test('non JPEG/PNG bytes -> INVALID_IMAGE before OCR runs', async () => {
  const ocr = fakeOcr('should not run');
  await assert.rejects(analyzeDocument({ image: { buffer: Buffer.from('GIF89a........') } }, { ocr, ai: fakeModel(GOOD_REPLY) }), { code: 'INVALID_IMAGE' });
  assert.equal(ocr.calls, 0);
});

test('oversized image buffer -> FILE_TOO_LARGE', async () => {
  const big = Buffer.concat([PNG_HEADER, Buffer.alloc(MAX_IMAGE_BYTES)]);
  await assert.rejects(analyzeDocument({ image: { buffer: big } }, { ocr: fakeOcr('x'), ai: fakeModel(GOOD_REPLY) }), { code: 'FILE_TOO_LARGE' });
});

test('OCR throws or finds almost nothing -> OCR_FAILED', async () => {
  const ai = fakeModel(GOOD_REPLY);
  await assert.rejects(analyzeDocument({ image: { buffer: PNG_HEADER } }, { ocr: fakeOcr(new Error('decode')), ai }), { code: 'OCR_FAILED' });
  await assert.rejects(analyzeDocument({ image: { buffer: PNG_HEADER } }, { ocr: fakeOcr(' ~ | . '), ai }), { code: 'OCR_FAILED' });
  assert.equal(ai.prompts.length, 0);
});

test('model errors or unusable output -> AI_PROCESSING_FAILED', async () => {
  const ocr = fakeOcr('');
  for (const reply of [new Error('HTTP 429'), 'not json at all', '[1,2,3]', { keyActions: [] }, { simplifiedText: '   ' }]) {
    await assert.rejects(analyzeDocument({ text: DOC }, { ocr, ai: fakeModel(reply) }), { code: 'AI_PROCESSING_FAILED' }, String(reply));
  }
});

test('JSON wrapped in fences or prose is recovered', async () => {
  for (const raw of ['```json\n' + JSON.stringify(GOOD_REPLY) + '\n```', 'Sure! Here it is: ' + JSON.stringify(GOOD_REPLY) + ' Hope that helps.']) {
    const data = await analyzeDocument({ text: DOC }, { ocr: fakeOcr(''), ai: fakeModel(raw) });
    assert.equal(data.simplifiedText, GOOD_REPLY.simplifiedText);
  }
});

test('coercion: enums normalized, unknown priority -> important, actions sorted critical first, extras dropped', async () => {
  const data = await analyzeDocument({ text: DOC }, {
    ocr: fakeOcr(''),
    ai: fakeModel({
      simplifiedText: 'ok',
      keyActions: [
        { action: 'Book follow-up', priority: 'LOW', icon: 'Calendar', extra: 'x' },
        { action: 'Mystery', priority: 'whatever', icon: 'pill' },
        { action: 'Take pill', priority: 'HIGH', icon: 'medication' },
        { action: '   ' },
        'Drink water',
        42,
      ],
      medicalTerms: [
        { term: 'SOB', definition: 'Shortness of breath', category: 'Symptom' },
        { term: 'sob', definition: 'duplicate', category: 'symptom' },
        { term: 'PCP', meaning: 'Your regular doctor', category: 'doctor' },
        { term: 'NoDef' },
      ],
    }),
  });
  assert.deepEqual(data.keyActions, [
    { action: 'Take pill', priority: 'critical', icon: 'medication' },
    { action: 'Mystery', priority: 'important', icon: 'info' },
    { action: 'Drink water', priority: 'important', icon: 'info' },
    { action: 'Book follow-up', priority: 'normal', icon: 'calendar' },
  ]);
  assert.deepEqual(data.medicalTerms, [
    { term: 'SOB', definition: 'Shortness of breath', category: 'symptom' },
    { term: 'PCP', definition: 'Your regular doctor', category: 'other' },
  ]);
});

test('coercion: non-array lists degrade to [], snake_case accepted, lists capped', async () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ term: `T${i}`, definition: 'd', category: 'test' }));
  const data = await analyzeDocument({ text: DOC }, {
    ocr: fakeOcr(''),
    ai: fakeModel({ simplified_text: 'ok', key_actions: 'nope', medical_terms: many }),
  });
  assert.equal(data.simplifiedText, 'ok');
  assert.deepEqual(data.keyActions, []);
  assert.equal(data.medicalTerms.length, 15);
});

test('prompt wraps document as data and lists the icon vocabulary', async () => {
  const ai = fakeModel(GOOD_REPLY);
  await analyzeDocument({ text: DOC }, { ocr: fakeOcr(''), ai });
  assert.match(ai.prompts[0].user, /^<document>\n[\s\S]*\n<\/document>$/);
  assert.match(ai.prompts[0].system, /medication, thermometer, emergency, calendar/);
});

test('mock model goes through the real pipeline, is labeled, and survives coercion unchanged', async () => {
  const ai = createMockModel();
  const data = await analyzeDocument({ text: DOC }, { ocr: fakeOcr(''), ai });
  assert.equal(data.originalText, DOC);
  assert.ok(data.simplifiedText.startsWith(MOCK_LABEL.trim()));
  assert.deepEqual({ ...data, originalText: undefined, simplifiedText: undefined }, { ...JSON.parse(await ai.generate()), originalText: undefined, simplifiedText: undefined });
  assert.deepEqual(new Set(data.keyActions.map((a) => a.priority)), new Set(['critical', 'important', 'normal']));
});

test('toErrorResponse: AnalyzeError keeps its code; unknown errors become AI_PROCESSING_FAILED 500', () => {
  assert.deepEqual(toErrorResponse(new AnalyzeError('FILE_TOO_LARGE')), {
    status: 413, body: { success: false, error: { code: 'FILE_TOO_LARGE', message: 'Image must be under 10MB' } },
  });
  const bug = toErrorResponse(new TypeError('boom'));
  assert.equal(bug.status, 500);
  assert.equal(bug.body.error.code, 'AI_PROCESSING_FAILED');
  assert.doesNotMatch(JSON.stringify(bug), /boom/);
});

test('AnalyzeError rejects unknown codes', () => {
  assert.throws(() => new AnalyzeError('NOPE'), TypeError);
});

test('healthReport reflects OCR status and mock mode', () => {
  assert.deepEqual(healthReport({ ocr: fakeOcr('', 'loading'), ai: createMockModel() }), { status: 'ok', services: { ocr: 'loading', ai: 'mock' } });
  assert.deepEqual(healthReport({ ocr: fakeOcr('', 'ready'), ai: fakeModel('') }), { status: 'ok', services: { ocr: 'ready', ai: 'ready' } });
});
