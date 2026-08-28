# Migration from the source runtime

codex-gemini-anyone is an independent generic distribution extracted from the provider-neutral runtime contracts of the source repository.

Private business modules, including Enola and Qimedo, are intentionally excluded. Private product data, account labels, credentials, browser state, environment paths, site publishing integrations, and business-specific registries are not part of this repository.

## Retained concepts

- deterministic task and route hashes
- local workspace containment
- logical account and Gem selection
- Gemini/Flow human handoff contracts
- Markdown output parsing
- provider safety counters
- local-only runtime status
- dry-run-oriented validation

## Deliberately not copied

- business-specific marketing registries
- product and site registries
- Shopify publishing logic
- private release bundles and duplicated historical snapshots
- real account configuration
- browser profiles, cookies, sessions, and credentials

## Compatibility note

The source runtime's public concepts are preserved at a smaller generic boundary. A private Skill can be installed separately by a user, as long as it satisfies the manifest contract and keeps its data/configuration outside this public repository.

