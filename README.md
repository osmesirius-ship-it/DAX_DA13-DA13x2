# DAX_DA13-DA13x2

DA-13 + DA-X ("Dax") is a stack of agents that checks and stabilizes model outputs before they ship. It drops into any app as a safety harness, adding policy checks, risk gates, and optional human review without forcing a new framework.
DA-13 + DA-X ("Dax") is a recursive governance core that stabilizes model outputs through a multi-layer agent stack. It is designed as a drop-in safety and alignment harness for frontier-model applications, adding policy enforcement, risk gating, and human-in-the-loop checkpoints without dictating your app framework.

- **What this repo contains:** shared documentation, configuration, and SDK stubs for overlaying Dax across web, mobile, CLI, and agent frameworks.
- **Start with:** [`docs/INTEGRATION.md`](docs/INTEGRATION.md) for code snippets, security notes, deployment playbooks, and SDK usage.
- **Handoff guide:** [`docs/ANTHROPIC_HANDOFF.md`](docs/ANTHROPIC_HANDOFF.md) for the exact steps and artifacts to share with Anthropic’s red team.
- **Enterprise TODOs:** [`docs/ENTERPRISE_TODO.md`](docs/ENTERPRISE_TODO.md) for the hardening checklist before production rollouts.
```mermaid
flowchart LR
  subgraph Governance Stack
    A[DA-13 Sentinel] --> B[DA-12 Chancellor]
    B --> C[DA-11 Custodian]
    C --> D[DA-10 Registrar]
    D --> E[DA-9 Verifier]
    E --> F[DA-8 Auditor]
    F --> G[DA-7 Steward]
    G --> H[DA-6 Conductor]
    H --> I[DA-5 Router]
    I --> J[DA-4 Observer]
    J --> K[DA-3 Sentry]
    K --> L[DA-2 Inspector]
    L --> M[DA-1 Executor]
    M --> N[DA-X Anchor]
  end
  Intent[[User intent]] --> A
  N --> Output[[Governed output]]
```

## Why Dax
- **Governance-first**: Thirteen disciplined refinement layers plus the DA-X anchor catch drift, hallucination, and policy violations before terminal actions are emitted.
- **Framework-agnostic**: Works with browsers, CLIs, agent frameworks, or bespoke services through a single recursion loop.
- **Auditable by default**: Every layer can emit rationale and evidence hooks to support investigations and compliance.

## Quick start (local experiment)
1. **Clone & install**
   ```bash
   git clone https://github.com/your-org/DAX_DA13-DA13x2.git
   cd DAX_DA13-DA13x2
   ```
2. **Configure layer prompts**: Tune governance per domain in [`config/layers.json`](config/layers.json).
2. **Configure layer prompts**: Adjust governance per domain via [`config/layers.json`](config/layers.json).
3. **Run a dry loop** (pseudo-code):
   ```javascript
   import { runDax } from './sdk/javascript/dax.js';

   const { output, audit } = await runDax('Summarize incident 42', {
     apiKey: process.env.XAI_API_KEY,
     includeReasons: true,
   });
   console.log(output, audit);
   ```
4. **Ship**: Plug in the overlay snippet or backend recipe in [`docs/INTEGRATION.md`](docs/INTEGRATION.md).

## Project layout
- `config/` – Layer prompts, policy templates, and tuning knobs.
- `docs/` – Guides for integration, releases, and architecture.
- `sdk/` – SDK stubs for browser, Node, and Python entrypoints.
- `tests/` – Safety and regression cases to extend for your stack.
4. **Ship**: Integrate using the overlay snippet or the backend recipe in [`docs/INTEGRATION.md`](docs/INTEGRATION.md).

## Project layout
- `config/` – Layer prompts, policy templates, and per-domain tuning knobs.
- `docs/` – Guides for integration, releases, and architecture.
- `sdk/` – SDK stubs for browser, Node, and Python entrypoints.
- `tests/` – Safety and regression cases you can extend for your stack.

## Documentation map
- **Integration**: Browser overlay, backend recipe, and environment expectations in [`docs/INTEGRATION.md`](docs/INTEGRATION.md).
- **Architecture**: Component responsibilities, lifecycle, and observability in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- **Disambiguation agent**: Plain-language rewrite helper for verbose documentation in [`docs/DISAMBIGUATION_AGENT.md`](docs/DISAMBIGUATION_AGENT.md).
- **Releases**: Versioning expectations and delivery steps in [`docs/RELEASE.md`](docs/RELEASE.md).

## Core loop (conceptual)
```mermaid
flowchart TD
  A[User intent] --> B(DA-13 Sentinel: mission & truth)
  B --> C(DA-12 Chancellor: policy map)
  C --> D(DA-11 Custodian: risk & escalation)
  D --> E(DA-10 Registrar: mandate template)
  E --> F(DA-9 Verifier: policy-as-code)
  F --> G(DA-8 Auditor: evidence hooks)
  G --> H(DA-7 Steward: human gate?)
  H --> I(DA-6 Conductor: workflow plan)
  I --> J(DA-5 Router: tool routing)
  J --> K(DA-4 Observer: telemetry)
  K --> L(DA-3 Sentry: drift/contradictions)
  L --> M(DA-2 Inspector: coherence audit)
  M --> N(DA-1 Executor: terminal action)
  N --> O(DA-X Anchor: stability check)
  O --> P[Emission]
```

## Next steps
- Add your domain policies to `config/layers.json` and run targeted tests.
- Extend SDK adapters to your toolchain; see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for component responsibilities.
- Wire telemetry to your observability stack for per-layer latency, retries, and drift alerts.

---

**Model note:** This repository assumes access to `grok-4` (or compatible) at `https://api.x.ai/v1/chat/completions`. Swap in your provider where needed.
