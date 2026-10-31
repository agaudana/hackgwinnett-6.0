// Drift guard: fails if the backend's error catalog stops matching API_CONTRACT.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AnalyzeError, toErrorResponse } from '../src/analyze.js';

const CONTRACT = fileURLToPath(new URL('../../API_CONTRACT.md', import.meta.url));

/** Every "#### <status> ..." heading followed by a ```json error block. */
function contractErrors(markdown) {
  const blocks = [...markdown.matchAll(/^####\s+(\d{3})[^\n]*\n```json\n([\s\S]*?)\n```/gm)];
  return blocks.map(([, status, json]) => ({ status: Number(status), body: JSON.parse(json) }));
}

test('error codes, statuses, and messages equal API_CONTRACT.md', { skip: !existsSync(CONTRACT) && 'API_CONTRACT.md not found' }, () => {
  // Normalize CRLF: Windows checkouts (core.autocrlf=true) otherwise match zero blocks.
  const errors = contractErrors(readFileSync(CONTRACT, 'utf8').replace(/\r\n/g, '\n'));
  assert.equal(errors.length, 5, 'expected 5 error examples in API_CONTRACT.md');
  for (const { status, body } of errors) {
    assert.deepEqual(toErrorResponse(new AnalyzeError(body.error.code)), { status, body });
  }
});
