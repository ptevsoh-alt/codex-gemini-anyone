# codex-gemini-anyone

A portable, configuration-driven runtime for routing tasks to Gemini or Flow web workflows and preparing safe human handoffs.

This project extracts the provider-neutral parts of a private local runtime into an independent distribution:

- task classification and deterministic task IDs
- manifest-based Skill discovery and routing
- configurable logical Account and Gem routing
- Gemini / Flow handoff packages
- Markdown output parsing and file handoff metadata
- loopback Gateway
- workspace containment checks
- SHA-256 integrity hashes
- secret and identity guardrails

## Important capability boundary

The source runtime does not contain a browser driver or an automatic Gemini/Flow submitter. This distribution therefore prepares a complete handoff package and records the expected manual steps. It does not navigate a browser, paste a prompt, read cookies, authenticate an account, poll a provider, or download a result automatically.

That boundary is deliberate: a new device uses its own browser profile and a user manually signs in.

## Quick start

Requirements: Node.js 18 or newer.

~~~powershell
git clone https://github.com/ptevsoh-alt/codex-gemini-anyone.git
cd codex-gemini-anyone
.\scripts\setup.ps1
npm test
npm run security:scan
npm run skills:list
~~~

Edit the generated config/*.local.yaml files, then:

~~~powershell
node .\bin\codex-gemini.js route "summarize this example handoff request"
node .\bin\codex-gemini.js handoff "prepare a short blog draft"
~~~

## Configuration

Configuration is local-only and ignored by Git:

- config/accounts.local.yaml: logical account labels, provider capability labels, and local browser-context labels
- config/gems.local.yaml: user-defined Gem labels and their logical account
- config/paths.local.yaml: workspace, skills, downloads, and output roots
- config/config.local.yaml: runtime defaults

No real email, password, token, cookie, session export, or browser data belongs in these files.

See the Configuration, Accounts, and Gemini documentation.

## Skills

Skills are discovered from skills/*/manifest.yaml or manifest.json. An example is included in skills/example-skill.

~~~powershell
npm run skills:list
~~~

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

See docs/ARCHITECTURE.md.

## Security

The runtime is fail-closed around identity-bearing configuration. It never imports browser data and never stores provider credentials. All generated routes and handoffs retain execution_allowed: false, browser_automation: false, provider_calls: 0, and quota_usage: 0.

Run npm run security:scan before publishing changes.

## Documentation

- docs/INSTALL.md
- docs/CONFIGURATION.md
- docs/ACCOUNTS.md
- docs/SKILLS.md
- docs/GEMINI.md
- docs/FLOW.md
- docs/TROUBLESHOOTING.md
- docs/MIGRATION_FROM_CODEX_GEMINI.md
- docs/SOURCE_AUDIT.md

