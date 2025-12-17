// Minimal JavaScript SDK for running DA-13/DA-X recursion.
// Zero dependencies; uses global fetch. Configure with your own transport to swap HTTP stacks.

const DEFAULT_LAYERS = require('../../config/layers.json');

function mergeLayers(overrides = {}) {
  return DEFAULT_LAYERS.map((layer) => {
    const override = overrides[layer.id];
    return override ? { ...layer, ...override } : layer;
  });
}

async function defaultTransport({ apiKey, model, messages }) {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  const json = await res.json();
  return json.choices[0].message.content.trim();
}

function createDaxRunner({ apiKey, model = 'grok-4', transport = defaultTransport, layerOverrides, includeReasons = false } = {}) {
  if (!apiKey) throw new Error('apiKey is required');
  const layers = mergeLayers(layerOverrides);

  return {
    async run(input) {
      let current = input;
      const trace = [];
      for (const layer of layers) {
        const instructions = includeReasons
          ? `${layer.prompt}\nRespond as JSON with keys: output (stabilized text) and reason (brief audit note).`
          : `${layer.prompt}\nRespond with only the stabilized text. No meta-commentary.`;

        const messages = [
          {
            role: 'user',
            content: `You are ${layer.name} acting as ${layer.agent}.\nDuty: ${layer.desc}.\nProtocol: ${instructions}\nPrior output:\n${current}`,
          },
        ];

        const reply = await transport({ apiKey, model, messages });

        if (includeReasons) {
          try {
            const parsed = JSON.parse(reply);
            current = parsed.output?.trim() || '';
            trace.push({ layer: layer.name, output: current, reason: parsed.reason || '' });
          } catch (err) {
            throw new Error(`${layer.name} returned non-JSON while includeReasons=true: ${reply}`);
          }
        } else {
          current = reply;
          trace.push({ layer: layer.name, output: current });
        }
      }
      return { output: current, trace };
    },
  };
}

module.exports = { createDaxRunner, mergeLayers, DEFAULT_LAYERS };
