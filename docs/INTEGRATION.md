# DA-13 / DA-X Overlay & Integration Guide

This guide packages the minimal code and step-by-step instructions required to layer the DA-13 + DA-X governance stack ("Dax") on top of other systems. It is framework-agnostic and assumes zero existing dependencies.

## Architecture Snapshot
- **DA-13 → DA-1**: Sequential refinement layers that enforce governance, policy validation, and terminal action discipline.
- **DA-X core**: Recursive stability guard that halts or re-centers outputs when drift is detected.
- **Execution loop**: Each layer receives the previous output, applies its role-specific prompt, and returns a stabilized string. The final output is emitted only after all layers are stable.

## Minimal Overlay Snippet (Browser / WebView)
Embed this in any HTML surface to run the full stack. Replace `YOUR_XAI_API_KEY` with a secret provided via environment injection or server-side templating.

```html
<div id="dax-overlay">
  <textarea id="dax-input" placeholder="Enter intent"></textarea>
  <button id="dax-run">Run Dax</button>
  <pre id="dax-log">Ready.</pre>
</div>
<script>
const layers = [
  {id:13,name:"DA-13",desc:"Strategic intent & truth constraints",agent:"Sentinel — restate the mission, forbid fabrication, and center on verifiable truth."},
  {id:12,name:"DA-12",desc:"Meta-policy alignment",agent:"Chancellor — map intent to governing policies and refuse conflicts of interest."},
  {id:11,name:"DA-11",desc:"Risk appetite & escalation matrix",agent:"Custodian — downgrade risky intents, flag P0/P1 for human escalation."},
  {id:10,name:"DA-10",desc:"Mandate template registry",agent:"Registrar — choose the correct mandate template and fill only scoped fields."},
  {id:9,name:"DA-9",desc:"Policy-as-code validation",agent:"Verifier — lint against policy rules and reject disallowed operations."},
  {id:8,name:"DA-8",desc:"Evidence trail attestation",agent:"Auditor — add minimal evidence hooks; no PII leakage."},
  {id:7,name:"DA-7",desc:"Human-in-the-loop gates",agent:"Steward — decide if a human checkpoint is mandatory; annotate rationale."},
  {id:6,name:"DA-6",desc:"Workflow orchestration",agent:"Conductor — split tasks, order them, and ensure prerequisites are met."},
  {id:5,name:"DA-5",desc:"Execution adapter routing",agent:"Router — map steps to adapters/tools; avoid unsupported actions."},
  {id:4,name:"DA-4",desc:"Telemetry & feedback loop",agent:"Observer — request only essential metrics; avoid sensitive data."},
  {id:3,name:"DA-3",desc:"Anomaly detection & drift alert",agent:"Sentry — scan for contradictions, bias, or policy drift; halt if found."},
  {id:2,name:"DA-2",desc:"Structural self-audit",agent:"Inspector — check coherence and completeness; remove redundancies."},
  {id:1,name:"DA-1",desc:"Terminal action emission",agent:"Executor — emit final action text only; no meta-commentary."},
  {id:"X",name:"DA-X",desc:"Recursive stability core",agent:"Anchor — run a final stability check; rollback or halt on anomalies."}
];

async function runDax(input) {
  let current = input;
  for (const layer of layers) {
    const payload = {
      model: "grok-4",
      messages: [{ role: "user", content: `You are ${layer.name} acting as ${layer.agent}\nPrimary duty: ${layer.desc}\nPrior output:\n${current}\nApply your duty and respond with only the improved, policy-safe text. No meta commentary.` }],
      temperature: 0.2
    };
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${YOUR_XAI_API_KEY}` // inject securely
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Layer ${layer.name} failed: HTTP ${res.status}`);
    const data = await res.json();
    current = data.choices[0].message.content.trim();
  }
  return current;
}

document.getElementById("dax-run").onclick = async () => {
  const log = document.getElementById("dax-log");
  log.textContent = "Running...";
  try {
    const output = await runDax(document.getElementById("dax-input").value.trim());
    log.textContent = output;
  } catch (err) {
    log.textContent = err.message;
  }
};
</script>
```

### Notes for the overlay snippet
- **CORS**: If the host does not return permissive CORS headers, route through a vetted proxy (e.g., codetabs.com or a self-hosted cors-anywhere) and restrict allowed origins.
- **Secrets**: Do **not** hardcode keys. Inject via server-rendered templates, environment-derived meta tags, or a backend token exchange.
- **Fallback models**: Add a retry path to Grok-3 or a cached response if `HTTP 429/5xx` occurs.

### Layer-specific agents and duties
- **DA-13 — Sentinel:** Restate mission intent, anchor on verifiable truth, reject fabrication.
- **DA-12 — Chancellor:** Map to governing policies, resolve conflicts, prevent misaligned intents.
- **DA-11 — Custodian:** Re-rate risk, enforce escalation thresholds, downgrade unsafe intents.
- **DA-10 — Registrar:** Select the correct mandate template, populate only scoped fields.
- **DA-9 — Verifier:** Lint against policy-as-code rules, block disallowed operations.
- **DA-8 — Auditor:** Attach minimal evidence hooks without leaking PII.
- **DA-7 — Steward:** Decide if human approval is mandatory; annotate rationale.
- **DA-6 — Conductor:** Split tasks, order dependencies, and ensure prerequisites are met.
- **DA-5 — Router:** Map steps to the right adapters/tools; avoid unsupported actions.
- **DA-4 — Observer:** Request only essential telemetry; avoid sensitive data.
- **DA-3 — Sentry:** Detect contradictions/bias/drift; halt or raise alerts if present.
- **DA-2 — Inspector:** Self-audit structure for coherence, completeness, and redundancy removal.
- **DA-1 — Executor:** Emit the final action text only; no meta-commentary.
- **DA-X — Anchor:** Final stability check with rollback/halt on anomalies.

## Backend / Service Integration
1. **Wrap the recursion** in a server function (e.g., Node, Python, Go) that accepts `input` and returns the stabilized string. This keeps API keys server-side.
2. **Expose an internal endpoint** `/dax/recursion` for front-ends to call. Enforce auth (JWT/session) and rate limits.
3. **Logging & evidence**: Persist per-layer inputs/outputs for DA-8 evidence trails and DA-3 anomaly alerts.
4. **Safety guards**: Add timeouts and per-layer circuit breakers; cap message length to prevent runaway costs.

## Integration Playbooks
- **Web apps**: Mount the overlay in a modal or side panel; stream per-layer status updates to the UI via SSE/WebSocket.
- **Mobile**: Use a WebView with the overlay snippet or call the backend endpoint directly and render a stepper UI in native components.
- **CLI**: Package the recursion loop as a command (`dax run "prompt"`) returning the final stabilized output and a JSON trace of layer transitions.
- **Agent frameworks**: Register Dax as a tool that transforms prompts before action selection; enforce DA-7 human gates before terminal actions.

## Development & Testing Checklist
- Run unit tests for the recursion loop with canned layer outputs.
- Simulate drift by injecting faulty layer responses and verify DA-X halts or re-centers.
- Validate CORS/proxy routing in staging before exposing to production origins.
- Add observability: latency per layer, failure counts, and retry rates.

## Security Considerations
- Keep API keys off the client; rotate regularly.
- Restrict outbound hosts from proxies; pin TLS where possible.
- Sanitize and log inputs to support DA-8 evidence and incident reviews.

## Next Steps
- Parameterize layer prompts via config to tailor governance per domain.
- Add optional `reason` side-channel from each layer for audit-only logs.
- Provide SDK wrappers (JavaScript/Python) that expose `runDax()` with pluggable transport and retry policies.
