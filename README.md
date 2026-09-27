# codex-gemini-anyone

[![CI](https://github.com/ptevsoh-alt/codex-gemini-anyone/actions/workflows/ci.yml/badge.svg)](https://github.com/ptevsoh-alt/codex-gemini-anyone/actions/workflows/ci.yml)

A portable, configuration-driven runtime for routing tasks to Gemini or Flow web workflows and preparing safe human handoffs.

The project extracts provider-neutral workflow orchestration from a private local runtime into an independent, reusable open-source distribution. It is designed for people who want deterministic routing, portable Skills, explicit account/provider boundaries, and auditable handoff metadata without shipping credentials or browser state.

> **Project status:** early-stage and actively maintained. The current public baseline is v0.1.0.

## Why this project exists

Multi-provider AI workflows often grow around one machine, one browser profile, or one set of private credentials. That makes them difficult to audit, share, reproduce, or contribute to safely.

codex-gemini-anyone keeps the reusable orchestration layer separate from identity-bearing browser state. The runtime focuses on:

- deterministic task classification and task IDs
- manifest-based Skill discovery and routing
- configurable logical Account and Gem routing
- Gemini / Flow handoff packages
- Markdown output parsing and file handoff metadata
- a loopback Gateway
- workspace containment checks
- SHA-256 integrity metadata
- secret and identity guardrails

This makes the workflow logic portable while leaving authentication and provider sessions under the user's control.

## Important capability boundary

The source runtime does **not** contain a browser driver or an automatic Gemini/Flow submitter. It prepares a complete handoff package and records the expected manual steps.

It does not:

- navigate a browser
- paste or submit prompts automatically
- read cookies or browser profiles
- authenticate provider accounts
- poll a provider session
- download provider results automatically
- store real passwords, tokens, cookies, or session exports

That boundary is deliberate. A new device uses its own browser profile and the user signs in directly.

## Quick start

Requirements: Node.js 18 or newer.

### Windows PowerShell

~~~powershell
git clone https://github.com/ptevsoh-alt/codex-gemini-anyone.git
cd codex-gemini-anyone
.\scripts\setup.ps1
npm test
npm run security:scan
npm run skills:list
~~~

### macOS / Linux

~~~bash
git clone https://github.com/ptevsoh-alt/codex-gemini-anyone.git
cd codex-gemini-anyone
./scripts/setup.sh
npm test
npm run security:scan
npm run skills:list
~~~

Edit the generated local configuration files, then:

~~~powershell
node .\bin\codex-gemini.js route "summarize this example handoff request"
node .\bin\codex-gemini.js handoff "prepare a short blog draft"
~~~

## Configuration

Configuration is local-only and ignored by Git:

- \`config/accounts.local.yaml\`: logical account labels, provider capability labels, and local browser-context labels
- \`config/gems.local.yaml\`: user-defined Gem labels and their logical account
- \`config/paths.local.yaml\`: workspace, skills, downloads, and output roots
- \`config/config.local.yaml\`: runtime defaults

No real email address, password, token, cookie, session export, or browser data belongs in these files.

See [Configuration](docs/CONFIGURATION.md), [Accounts](docs/ACCOUNTS.md), and [Gemini](docs/GEMINI.md).

## Skills

Skills are discovered from \`skills/*/manifest.yaml\` or \`manifest.json\`. An example is included in \`skills/example-skill\`.

~~~powershell
npm run skills:list
~~~

The runtime validates Skill manifests before routing. Skill dependencies can be declared for validation and documentation, but Skills do not automatically execute other Skills.

## Architecture

~~~text
User / Codex
  -> Task Router
  -> Skill Loader + Skill Router
  -> Account / Gem Router
  -> Gemini or Flow Handoff Contract
  -> Human web execution
  -> Local output directory
  -> Output Parser / QA
~~~

See [Architecture](docs/ARCHITECTURE.md).

## Security model

The runtime is fail-closed around identity-bearing configuration. It never imports browser data and never stores provider credentials.

Generated routes and handoffs retain an explicit safety envelope:

~~~yaml
execution_allowed: false
browser_automation: false
credentials_stored: false
provider_calls: 0
quota_usage: 0
submission_mode: HUMAN_COPY_ONLY
~~~

Before publishing changes, run:

~~~bash
npm test
npm run security:scan
~~~

CI runs the same checks on supported Node.js versions. See [SECURITY.md](SECURITY.md) for vulnerability-reporting guidance.

## Maintainer workflows

The project is structured so routine maintenance can be reviewed independently of private provider accounts. Useful maintenance work includes:

- reviewing routing and configuration changes
- expanding regression tests
- validating Skill manifests
- checking workspace/path containment
- detecting accidental secret or identity leakage
- reviewing release notes and documentation
- testing cross-platform setup behavior

This repository intentionally keeps provider authentication outside the source tree so contributors can work on these areas without receiving maintainer credentials.

## Documentation

- [Install](docs/INSTALL.md)
- [Configuration](docs/CONFIGURATION.md)
- [Accounts](docs/ACCOUNTS.md)
- [Skills](docs/SKILLS.md)
- [Gemini](docs/GEMINI.md)
- [Flow](docs/FLOW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Migration from codex-gemini](docs/MIGRATION_FROM_CODEX_GEMINI.md)
- [Source audit](docs/SOURCE_AUDIT.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), keep changes within the documented capability boundary, and include tests when behavior changes.

## Roadmap

The near-term focus is better validation, CI coverage, contributor documentation, and reproducible release practices. See [ROADMAP.md](ROADMAP.md).

## License

MIT. See [LICENSE](LICENSE).

## Independence

codex-gemini-anyone is an independent community project. It is not an official OpenAI or Google product and is not affiliated with or endorsed by either company.
