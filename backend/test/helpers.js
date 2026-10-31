import { createApp } from '../src/app.js';

export const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
export const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);

export function fakeOcr(textOrError, status = 'ready') {
  return {
    calls: 0,
    status: () => status,
    async recognize() {
      this.calls++;
      if (textOrError instanceof Error) throw textOrError;
      return textOrError;
    },
  };
}

export function fakeModel(replyOrError, mode = 'live') {
  return {
    mode,
    prompts: [],
    async generate(prompt) {
      this.prompts.push(prompt);
      if (replyOrError instanceof Error) throw replyOrError;
      return typeof replyOrError === 'string' ? replyOrError : JSON.stringify(replyOrError);
    },
  };
}

/** Start the real Express app on an ephemeral port with fake deps. */
export async function startApp(deps) {
  const logs = [];
  const app = createApp(deps, { corsOrigin: 'http://localhost:5173', log: (l) => logs.push(l) });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const url = `http://localhost:${server.address().port}`;
  return { url, logs, close: () => new Promise((r) => server.close(r)) };
}
