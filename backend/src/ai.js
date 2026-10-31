/**
 * Model ports. Both return the model's raw reply text; analyze.js parses and coerces it,
 * so the mock exercises the same pipeline as a real model.
 */

/** @typedef {import('./analyze.js').ModelPort} ModelPort */

/**
 * OpenAI Chat Completions over native fetch. One code path for both providers:
 *   - Direct OpenAI:  baseURL https://api.openai.com/v1
 *   - Amazon Bedrock: baseURL https://bedrock-runtime.<region>.amazonaws.com/openai/v1
 * Never puts the API key in errors or logs. No automatic retry: the contract message says "try again".
 * @param {{ apiKey: string, baseURL: string, model: string, timeoutMs: number }} config
 * @param {{ fetch?: typeof fetch }} [io] injectable for offline tests
 * @returns {ModelPort}
 */
export function createOpenAiModel(config, io = {}) {
  const doFetch = io.fetch ?? globalThis.fetch;
  return {
    mode: 'live',
    async generate({ system, user }) {
      const res = await doFetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      if (!res.ok) {
        const detail = (await res.text().catch(() => '')).slice(0, 200);
        throw new Error(`AI HTTP ${res.status}: ${detail}`);
      }
      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) throw new Error('AI returned no content');
      return content;
    },
  };
}

/** Prepended to simplifiedText in DEMO MODE. Visible on screen and read aloud. */
export const MOCK_LABEL = 'DEMO MODE: no AI key is set, so this is a sample explanation, not based on your document. ';

// Based on the API_CONTRACT.md success example so the frontend sees every priority level.
const MOCK_REPLY = Object.freeze({
  simplifiedText:
    MOCK_LABEL +
    "Take your antibiotic pill (amoxicillin) twice a day with food. Watch your temperature - if it goes above 101°F, that's important to note. Go back to the emergency room if your breathing gets worse. Schedule an appointment with your regular doctor within 7 to 10 days.",
  keyActions: [
    { action: 'Take amoxicillin 500mg twice daily with food', priority: 'critical', icon: 'medication' },
    { action: 'Return to emergency room if breathing worsens', priority: 'critical', icon: 'emergency' },
    { action: 'Watch for fever above 101°F', priority: 'important', icon: 'thermometer' },
    { action: 'Schedule follow-up with your doctor in 7-10 days', priority: 'normal', icon: 'calendar' },
  ],
  medicalTerms: [
    { term: 'amoxicillin', definition: 'An antibiotic medicine that fights bacterial infections', category: 'medication' },
    { term: 'PO BID', definition: 'By mouth, two times per day', category: 'instruction' },
    { term: 'SOB', definition: 'Shortness of breath - difficulty breathing', category: 'symptom' },
    { term: 'PCP', definition: 'Primary Care Provider - your regular doctor', category: 'provider' },
  ],
});

/** @returns {ModelPort} */
export function createMockModel() {
  return {
    mode: 'mock',
    async generate() {
      return JSON.stringify(MOCK_REPLY);
    },
  };
}
