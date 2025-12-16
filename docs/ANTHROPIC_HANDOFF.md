# Anthropic Red-Team Handoff Checklist

Use this checklist to prepare the DA-13 / DA-X (“Dax”) stack for Anthropic’s red-team validation. It links back to the canonical integration guide and surfaces the exact artifacts Anthropic needs to exercise the system safely.

## 1) Freeze the evaluation surface
- Confirm `config/layers.json` is the authoritative set of layer roles, agents, and prompts for this test cycle. Export the file you ship to Anthropic so they exercise the exact posture you intend.
- Choose a single entry surface (browser overlay or backend endpoint) and stick to it for the evaluation window. Avoid changing transports mid-run.

## 2) Package the endpoint/overlay they will hit
- **Overlay option:** Host the minimal snippet from `docs/INTEGRATION.md` with `includeReasons: true`, wired to your backend token proxy. Lock allowed origins to Anthropic’s test IPs or auth tokens.
- **Backend option:** Expose `/dax/recursion` (or equivalent) that wraps the SDK runner. Keep API keys server-side, enforce authentication + rate limits, and return `{ output, trace }` (trace includes per-layer reasons when enabled).

## 3) Evidence and audit hooks
- Enable `includeReasons` / `include_reasons` so each layer emits a `reason` string. Persist `{layer, output, reason}` for DA-8 evidence trails and DA-3 anomaly reviews.
- Log transport metadata (model, retries, proxy used, timestamps) so red-team findings can be mapped to infrastructure behavior.

## 4) Security hardening (must-do)
- Remove any embedded secrets from HTML or config. Inject keys at runtime on the server and never expose them to the client.
- Validate CORS/proxy settings; restrict outbound hosts from any proxy layer to the xAI endpoint only.
- Add request/response size limits, timeouts, and circuit breakers per layer to avoid runaway costs or hangs.

## 5) Baseline tests to run and share
- Execute both SDK suites and attach results/logs:
  - `node tests/javascript/runDax.test.js`
  - `python -m unittest tests/python/test_run_dax.py`
- Run a smoke test through the exact surface Anthropic will hit (overlay or backend). Capture the per-layer trace and model name so they can reproduce.

## 6) Document the handoff
- Provide Anthropic with:
  - Architecture snapshot (chosen model, transport, retries/backoff, proxy settings).
  - The exact `config/layers.json` used (attach the file or hash + commit ID).
  - Any domain-specific prompt overrides or disabled layers.
  - How to call the surface (URL, auth, expected request/response schema) and whether `includeReasons` is enabled.
- Point them to `docs/INTEGRATION.md` for protocol semantics, overlay code, and SDK options.

## 7) Success criteria
- Anthropic can reproduce the recursion loop with per-layer traces.
- Security controls (auth, rate limits, CORS) block unauthorized use.
- Evidence trails tie every finding to a specific layer, prompt, and transport configuration.
