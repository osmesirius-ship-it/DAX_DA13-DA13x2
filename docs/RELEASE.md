# Release Checklist (merge work into main)

Follow this checklist before merging Dax updates into `main`:

1. **Unit tests**
   - JavaScript: `node tests/javascript/runDax.test.js`
   - Python: `python -m unittest tests/python/test_run_dax.py`
2. **Config sanity**
   - Verify `config/layers.json` loads and includes any domain-specific overrides needed for the release.
   - Confirm agent prompts match the intended governance posture for the deployment.
3. **Docs**
   - Ensure `docs/INTEGRATION.md` reflects any new transport, overlay, or audit behaviors.
   - Update `README.md` if the entrypoint or test commands changed.
4. **Security**
   - Confirm no keys or secrets are committed.
   - Recheck proxy/CORS guidance for client-facing overlays.
5. **Versioning**
   - Note notable changes in the commit message and PR description so downstream consumers know what shifted.

Once these are satisfied, open the PR against `main` and merge after CI or manual checks pass.
