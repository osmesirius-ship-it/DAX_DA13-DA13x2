const assert = require('assert');
const { createDaxRunner, mergeLayers, DEFAULT_LAYERS } = require('../../sdk/javascript/runDax');

(async () => {
  // Verify layer overrides are merged in order.
  const merged = mergeLayers({ 10: { prompt: 'override-prompt' } });
  assert.strictEqual(
    merged.find((l) => l.id === 10).prompt,
    'override-prompt',
    'mergeLayers should apply overrides by id'
  );

  // Track calls to ensure each layer is invoked sequentially with prior output.
  const calls = [];
  const runner = createDaxRunner({
    apiKey: 'test-key',
    includeReasons: false,
    transport: async ({ messages }) => {
      const content = messages[0].content;
      calls.push(content);
      return `reply-${calls.length}`;
    },
  });

  const { output, trace } = await runner.run('seed');
  assert.strictEqual(trace.length, DEFAULT_LAYERS.length, 'should run all layers');
  assert.strictEqual(output, `reply-${DEFAULT_LAYERS.length}`, 'final output should match last reply');

  // Ensure the second layer received the first layer output embedded.
  assert(
    calls[1].includes('reply-1'),
    'layer 2 prompt should include output from layer 1'
  );

  // includeReasons should parse JSON payloads and capture reasons.
  const runnerWithReasons = createDaxRunner({
    apiKey: 'test-key',
    includeReasons: true,
    transport: async () => JSON.stringify({ output: 'clean', reason: 'ok' }),
  });

  const result = await runnerWithReasons.run('seed');
  assert.strictEqual(result.output, 'clean', 'output should come from parsed JSON');
  assert.strictEqual(result.trace[0].reason, 'ok', 'reason should be captured in trace');

  console.log('All JavaScript tests passed');
})();
