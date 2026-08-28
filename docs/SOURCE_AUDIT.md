# Source audit

## Repository facts

The source default branch was read through the authenticated GitHub connector. It contains approximately 1,500 tracked blobs and about 8 MB of tree content, with a large release subtree duplicating the application. Its package is CommonJS, Node.js 18+, and has no third-party runtime dependency.

## Actual architecture

The source is a local planning and safety runtime:

- registry loading and version/hash checks
- local workspace and task queue
- task/marketing classification and routing
- logical account/Gem/environment validation
- human approval and scoped permit contracts
- prompt compilation and Markdown handoff
- output intake/parser/validation
- dry-run and local Gateway
- site publishing boundaries and audit/ledger modules

## Provider audit

No source path implements a browser driver, browser automation, Gemini UI submit, Flow UI submit, provider polling, or provider download adapter. The provider-facing modules create logical assignments, execution packages, or human-copy handoffs. Their fixed safety fields remain zero.

Therefore the generic repository reports:

- Gemini handoff: implemented
- Flow handoff: implemented as a logical/manual contract
- Browser automation: not implemented
- Automatic download: not implemented

## Skill audit

The source contains Skill-like business registries and route references. It does not contain a generic SKILL.md discovery/runner system. The manifest-based Loader and Router in this repository are a generic extension layer added for the distribution; they do not execute arbitrary Skill code.

## Skill interaction result

The actual source pattern is:

~~~text
Codex/main Runtime
  -> route/prepare a Skill or specialist reference
  -> produce a structured package or Markdown handoff
  -> caller/orchestrator decides the next task
~~~

No verified direct Skill A -> Skill B import/call chain exists in the extracted provider-neutral path. The new generic runtime formalizes this as caller-orchestrated handoff.

## Main source-to-generic mapping

| Source concern | Generic destination |
|---|---|
| canonical hashing | runtime/common/canonical-json.js |
| YAML subset parsing | runtime/common/yaml-subset.js |
| portable security checks | runtime/common/portable-security.js |
| device-local workspace rules | runtime/workspace/index.js |
| logical account/Gem boundary | runtime/account-router, runtime/gem-router |
| Markdown/provider handoff | runtime/handoff, runtime/provider-handoff |
| output parsing | runtime/output-parser |
| local Gateway concept | runtime/gateway |
| business Skill registries | excluded; generic manifests are used instead |
| site/product publishing | excluded from generic release |

