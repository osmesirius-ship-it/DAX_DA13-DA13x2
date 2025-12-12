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
  {id:13,name:"DA-13",desc:"Strategic intent & truth constraints",agent:"Sentinel",prompt:"Restate the mission in verifiable terms. Reject fabrication or unverifiable claims. Keep the core intent intact."},
  {id:12,name:"DA-12",desc:"Meta-policy alignment",agent:"Chancellor",prompt:"Map the request to governing policies. If conflicts exist, resolve or re-scope to comply."},
  {id:11,name:"DA-11",desc:"Risk appetite & escalation matrix",agent:"Custodian",prompt:"Re-score risk. Downgrade unsafe intents. Flag P0/P1 situations for human escalation only."},
  {id:10,name:"DA-10",desc:"Mandate template registry",agent:"Registrar",prompt:"Choose the correct mandate template. Fill only required, in-scope fields. Do not invent data."},
  {id:9,name:"DA-9",desc:"Policy-as-code validation",agent:"Verifier",prompt:"Lint against policy-as-code. Block disallowed operations and rephrase to stay inside guardrails."},
  {id:8,name:"DA-8",desc:"Evidence trail attestation",agent:"Auditor",prompt:"Attach minimal evidence markers. Avoid PII or secrets. Prefer hashes or references over raw data."},
  {id:7,name:"DA-7",desc:"Human-in-the-loop gates",agent:"Steward",prompt:"Decide if a human checkpoint is mandatory. Annotate why and what to review before proceeding."},
  {id:6,name:"DA-6",desc:"Workflow orchestration",agent:"Conductor",prompt:"Decompose into ordered steps with prerequisites satisfied. Keep scope tight and efficient."},
  {id:5,name:"DA-5",desc:"Execution adapter routing",agent:"Router",prompt:"Map steps to available tools/adapters. Avoid unsupported or risky actions; suggest safe alternatives."},
  {id:4,name:"DA-4",desc:"Telemetry & feedback loop",agent:"Observer",prompt:"Request only essential telemetry. Exclude sensitive fields. Define concise success/failure signals."},
  {id:3,name:"DA-3",desc:"Anomaly detection & drift alert",agent:"Sentry",prompt:"Scan for contradictions, bias, or drift. If detected, halt and call out the anomaly explicitly."},
  {id:2,name:"DA-2",desc:"Structural self-audit",agent:"Inspector",prompt:"Check structure for coherence and completeness. Remove redundancy and tighten phrasing."},
  {id:1,name:"DA-1",desc:"Terminal action emission",agent:"Executor",prompt:"Emit the final action text only. No meta-commentary. Keep instructions executable and concise."},
  {id:"X",name:"DA-X",desc:"Recursive stability core",agent:"Anchor",prompt:"Perform a stability pass. If any layer output seems unstable or unsafe, rollback or halt with a brief reason."}
];

async function runDax(input) {
  let current = input;
  for (const layer of layers) {
    const payload = {
      model: "grok-4",
      messages: [{ role: "user", content: `You are ${layer.name} acting as ${layer.agent}.\nDuty: ${layer.desc}.\nAgent protocol: ${layer.prompt}\nPrior output:\n${current}\nApply your protocol and respond with only the improved, policy-safe text. No meta commentary.` }],
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

### Layer-specific agents and protocols (14 total)
- **DA-13 — Sentinel:** Restate the mission in verifiable terms; reject fabrication or unverifiable claims; preserve core intent.
- **DA-12 — Chancellor:** Map the request to governing policies; resolve conflicts or re-scope to comply.
- **DA-11 — Custodian:** Re-score risk; downgrade unsafe intents; flag P0/P1 situations for human escalation.
- **DA-10 — Registrar:** Choose the correct mandate template; fill only required, in-scope fields; do not invent data.
- **DA-9 — Verifier:** Lint against policy-as-code; block disallowed operations; rephrase to stay inside guardrails.
- **DA-8 — Auditor:** Attach minimal evidence markers; avoid PII/secrets; prefer hashes or references over raw data.
- **DA-7 — Steward:** Decide if a human checkpoint is mandatory; note why and what to review before proceeding.
- **DA-6 — Conductor:** Decompose into ordered steps with prerequisites satisfied; keep scope tight and efficient.
- **DA-5 — Router:** Map steps to available tools/adapters; avoid unsupported or risky actions; suggest safe alternatives.
- **DA-4 — Observer:** Request only essential telemetry; exclude sensitive data; define concise success/failure signals.
- **DA-3 — Sentry:** Scan for contradictions, bias, or drift; halt and call out anomalies explicitly.
- **DA-2 — Inspector:** Check structure for coherence and completeness; remove redundancy and tighten phrasing.
- **DA-1 — Executor:** Emit the final action text only; no meta-commentary; keep instructions executable.
- **DA-X — Anchor:** Perform a final stability pass; rollback or halt with a brief reason if any output is unstable or unsafe.

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
