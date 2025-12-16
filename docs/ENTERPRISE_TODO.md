# Enterprise Readiness TODOs for Dax

Use this checklist to harden and operationalize the DA-13 + DA-X stack for enterprise deployments. Treat each item as blocking until completed and captured in runbooks/SOPs.

## Governance & Prompts
- [ ] Freeze `config/layers.json` prompts per domain; version them and require approvals for changes.
- [ ] Define model allowlist/denylist (providers, versions, regions) and document fallback order.
- [ ] Map DA-7 human gates to named on-call rotations with SLAs and escalation paths.

## Security & Secrets
- [ ] Remove client-side keys; route all calls through an authenticated backend with rate limiting and mTLS where possible.
- [ ] Lock down proxy/CORS origins; restrict outbound hosts and enforce TLS pinning for upstreams.
- [ ] Enable request/response logging with redaction (PII/secrets) and signed evidence blobs for DA-8.
- [ ] Perform threat modeling (STRIDE-style) on overlay, SDK, and backend surfaces.

## Compliance & Data Handling
- [ ] Classify data handled by each layer; document retention and deletion policies.
- [ ] Add DSR/erasure hooks to traces and DA-8 evidence stores.
- [ ] Validate providers for residency requirements and complete DPAs/security reviews.

## Reliability & Performance
- [ ] Define SLOs for latency/success per layer and for end-to-end recursion; add alerts.
- [ ] Implement retry/backoff policies and per-layer circuit breakers; prove idempotent behavior where applicable.
- [ ] Add load tests with representative prompts to validate autoscaling and cost envelopes.

## Observability & Auditability
- [ ] Emit structured traces (per-layer input/output/reason, latency, model id) to a central store.
- [ ] Wire dashboards for drift rates (DA-3), human-gate frequency (DA-7), and rollback counts (DA-X).
- [ ] Integrate log search with saved views for incident/RCAs.

## Change Management
- [ ] Require PR-based changes with reviewers from safety and platform; gate merges on passing unit/integration tests.
- [ ] Maintain migration notes for prompt/schema changes and provide rollback steps.
- [ ] Version SDKs and overlay assets; publish changelog entries for downstream teams.

## Integration Hardening
- [ ] Provide reference deployments (web overlay, CLI, backend endpoint) with IaC (e.g., Terraform) and CI/CD templates.
- [ ] Add contract tests for transports (HTTP/proxy), auth (JWT/OIDC), and streaming modes if used.
- [ ] Validate error surfaces: redaction on failure, user-friendly messages, and deterministic error codes.

## Incident Response & Continuity
- [ ] Define P0/P1 playbooks for drift, outage, data spill, and model regression scenarios.
- [ ] Ensure backup/restore for evidence stores and config (prompts, overrides, routing tables).
- [ ] Run tabletop exercises with DA-3 anomaly injection and DA-X rollback drills.

## External Validation
- [ ] Prepare red-team packs (prompt set, surfaces, transport policies, sample traces) for partners like Anthropic.
- [ ] Capture findings and fold remediations into release criteria before GA.

## Documentation & Training
- [ ] Publish operator runbooks for on-call rotations and human review checkpoints.
- [ ] Create consumer-facing docs for integrating SDKs, overlay snippet, and error handling semantics.
- [ ] Provide FAQ covering data use, safety posture, and support channels.
