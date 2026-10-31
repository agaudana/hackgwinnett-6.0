import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOpenAiModel } from '../src/ai.js';
import { readConfig } from '../src/config.js';

const CFG = { apiKey: 'sk-test', baseURL: 'https://example.test/v1', model: 'gpt-4o', timeoutMs: 1000 };

function fakeFetch(status, body) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
  };
  fn.calls = calls;
  return fn;
}

test('openai adapter sends chat completion request and returns content', async () => {
  const fetch = fakeFetch(200, { choices: [{ message: { content: '{"simplifiedText":"hi"}' } }] });
  const out = await createOpenAiModel(CFG, { fetch }).generate({ system: 'S', user: 'U' });
  assert.equal(out, '{"simplifiedText":"hi"}');
  const { url, init } = fetch.calls[0];
  assert.equal(url, 'https://example.test/v1/chat/completions');
  assert.equal(init.headers.Authorization, 'Bearer sk-test');
  const sent = JSON.parse(init.body);
  assert.equal(sent.model, 'gpt-4o');
  assert.deepEqual(sent.messages, [{ role: 'system', content: 'S' }, { role: 'user', content: 'U' }]);
  assert.deepEqual(sent.response_format, { type: 'json_object' });
});

test('openai adapter throws on HTTP error or empty content, without the key in the message', async () => {
  await assert.rejects(createOpenAiModel(CFG, { fetch: fakeFetch(401, 'unauthorized') }).generate({ system: '', user: '' }), (err) => {
    assert.match(err.message, /AI HTTP 401/);
    assert.doesNotMatch(err.message, /sk-test/);
    return true;
  });
  await assert.rejects(createOpenAiModel(CFG, { fetch: fakeFetch(200, { choices: [] }) }).generate({ system: '', user: '' }), /no content/);
});

test('readConfig: no key or MOCK_AI=1 -> mock; key -> live with defaults', () => {
  assert.equal(readConfig({}).ai.mode, 'mock');
  assert.equal(readConfig({ OPENAI_API_KEY: '   ' }).ai.mode, 'mock');
  assert.equal(readConfig({ OPENAI_API_KEY: 'sk-x', MOCK_AI: '1' }).ai.mode, 'mock');
  const live = readConfig({ OPENAI_API_KEY: 'sk-x', OPENAI_BASE_URL: 'https://bedrock.test/openai/v1/' });
  assert.deepEqual(live.ai, { mode: 'live', apiKey: 'sk-x', baseURL: 'https://bedrock.test/openai/v1', model: 'gpt-4o', timeoutMs: 45000 });
  assert.equal(readConfig({}).port, 3000);
  assert.equal(readConfig({ PORT: 'abc' }).port, 3000);
  assert.equal(readConfig({}).corsOrigin, 'http://localhost:5173');
});
