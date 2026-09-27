# Contributing

Thanks for helping improve codex-gemini-anyone.

## Before you start

Please read the README capability boundary and docs/ARCHITECTURE.md. The public runtime intentionally separates reusable workflow orchestration from provider credentials and browser identity state.

Changes should not introduce real credentials, cookies, session exports, browser-profile data, or hidden authenticated automation.

## Development setup

Requirements: Node.js 18 or newer.

~~~bash
git clone https://github.com/ptevsoh-alt/codex-gemini-anyone.git
cd codex-gemini-anyone
npm test
npm run security:scan
npm run skills:list
~~~

Use the platform setup script if you want generated local configuration:

~~~bash
./scripts/setup.sh
~~~

On Windows PowerShell:

~~~powershell
.\scripts\setup.ps1
~~~

## Pull requests

Keep PRs focused and explain:

1. what behavior or documentation changes
2. why the change is needed
3. what tests cover the change
4. whether the security or identity boundary changes

For behavior changes, add or update regression tests when practical.

Before opening or updating a PR, run:

~~~bash
npm test
npm run security:scan
~~~

CI runs these checks on supported Node.js versions.

## Security-sensitive changes

Treat changes involving path resolution, local configuration, identity labels, handoff metadata, or secret detection as security-sensitive. Prefer fail-closed behavior when input is invalid or ambiguous.

Do not put real provider credentials or browser-state exports in fixtures, examples, issues, or pull requests.

## Scope

Good contributions include:

- routing correctness and deterministic behavior
- Skill manifest validation
- output parsing and handoff metadata
- workspace containment
- security guardrails
- cross-platform setup
- tests and documentation

A proposal that would add authenticated browser automation or credential persistence should begin with an issue describing the threat model and proposed safeguards before implementation.
