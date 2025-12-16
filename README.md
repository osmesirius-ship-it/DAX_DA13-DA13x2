# DAX_DA13-DA13x2

DA-13 + DA-X Recursive Governance Core – the first working cognitive immune system for frontier AI models.

- **What this repo contains:** shared documentation, configuration, and SDK stubs for overlaying Dax across web, mobile, CLI, and agent frameworks.
- **Start with:** [`docs/INTEGRATION.md`](docs/INTEGRATION.md) for code snippets, security notes, deployment playbooks, and SDK usage.
- **Handoff guide:** [`docs/ANTHROPIC_HANDOFF.md`](docs/ANTHROPIC_HANDOFF.md) for the exact steps and artifacts to share with Anthropic’s red team.
- **Enterprise TODOs:** [`docs/ENTERPRISE_TODO.md`](docs/ENTERPRISE_TODO.md) for the hardening checklist before production rollouts.

## Testing
- JavaScript SDK checks: `node tests/javascript/runDax.test.js`
- Python SDK checks: `python -m unittest tests/python/test_run_dax.py`

## Release
See `docs/RELEASE.md` for the checklist to merge updates into `main`.
