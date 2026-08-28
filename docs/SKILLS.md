# Skills

## What a Skill is

A Skill is a versioned, manifest-driven capability description. It tells the runtime:

- how it is identified
- which request words can trigger it
- which capabilities it supports
- its input/output contract
- declared dependencies
- whether it expects a human handoff

## Where Skills live

Each Skill is a child directory of skills/ and contains:

~~~text
skills/<skill-directory>/
  manifest.yaml
  SKILL.md
  README.md
~~~

manifest.json is also supported.

## Create a Skill

1. Copy skills/example-skill.
2. Change skill_id, version, and description.
3. Add precise triggers and capabilities.
4. Declare input, output, and dependencies.
5. Write the operating instructions in SKILL.md.
6. Run npm run skills:list.
7. Route a request with an explicit skill_id first.
8. Add tests for ambiguous and missing routes.

## Discovery and routing

The Skill Loader reads manifests and validates the public shape. The Skill Router:

- honors an explicit skill_id
- otherwise scores trigger matches
- rejects ties as ambiguous
- creates a deterministic route hash
- does not execute Skill code

## Skill-to-Skill handoff

Direct import/call is not supported. A Skill returns structured data or Markdown. Codex/the caller creates a follow-up task and routes it to the next Skill. This keeps boundaries visible and testable.

## Provider access

A Skill can declare execution_mode: HANDOFF_ONLY. It can prepare a prompt, but it cannot navigate a browser or use credentials. Provider handoff is always explicit and human-mediated in this release.

