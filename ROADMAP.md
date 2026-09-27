# Roadmap

This roadmap describes the intended direction of codex-gemini-anyone. It is not a guarantee of delivery dates.

## Current baseline — v0.1.x

The current public baseline provides:

- deterministic task envelopes
- manifest-based Skill discovery and routing
- logical Account and Gem routing
- Gemini / Flow handoff contracts
- output parsing and handoff metadata
- loopback Gateway support
- workspace containment checks
- SHA-256 integrity metadata
- fail-closed execution flags
- secret and identity scanning
- cross-platform setup scripts
- automated CI for tests and security scanning

## Next

### Validation and reliability

- increase negative-path and malformed-config test coverage
- add more regression fixtures for routing behavior
- strengthen path-containment tests across Windows, macOS, and Linux
- add schema-level validation for additional manifest fields

### Contributor experience

- document extension points for providers and Skills
- add clearer examples for non-default routing
- add issue templates for reproducible bug reports
- maintain a release checklist and compatibility notes

### Security

- expand secret-scanning patterns while keeping false positives manageable
- add tests for identity-bearing configuration rejection
- document threat boundaries and expected local trust assumptions
- review generated handoff metadata for accidental sensitive-data propagation

## Later

- provider-neutral interfaces for additional human-mediated workflows
- richer local observability for routing decisions
- compatibility fixtures for multiple Skill manifest versions
- optional machine-readable diagnostics suitable for CI consumers

## Non-goals unless the security model changes explicitly

The project does not currently plan to embed provider credentials, export browser sessions, read cookies, or silently automate authenticated browser actions. Any future change to those boundaries would require explicit design review, documentation, and security tests.
