## Description
Briefly explain the goal and scope of this pull request.

## Checklist
Please verify each of the following before submitting:

- [ ] **Tests pass**: `npm test` runs and all tests pass cleanly.
- [ ] **No secrets**: `npm run scan:bundle` passes and no API keys or `.env` credentials are committed.
- [ ] **Simulated data labelled**: Any new UI presenting prices, holdings, or charts mounts `<SimulatedBadge />` or `<DataSourceFootnote />`.
- [ ] **Lint and build clean**: `npm run verify` (`build` + `scan:bundle` + `test`) exits with code 0.
- [ ] **Docs updated**: Any new extension points or configuration changes are documented.

