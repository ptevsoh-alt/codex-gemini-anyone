# Architecture

## Runtime call chain

~~~text
User / Codex
  -> Task Router
  -> Skill Loader
  -> Skill Router
  -> Account Router
  -> Gem Router
  -> Provider Handoff
  -> Human Gemini or Flow session
  -> Local output
  -> Output Parser
~~~

The first seven stages are implemented locally. The provider session is intentionally human-mediated because the source repository contains no browser driver or provider submitter.

## Components

| Component | Responsibility | Side effect |
|---|---|---|
| Task Router | classify request, create deterministic task envelope | none |
| Skill Loader | discover and validate manifests | reads local files |
| Skill Router | explicit or trigger-based Skill selection | none |
| Account Router | validate and select logical account labels | reads local config |
| Gem Router | resolve provider, account, optional Gem and browser-context label | none |
| Provider Handoff | produce immutable-ish prompt/input/output contract | writes only when caller chooses |
| Output Parser | preserve and index returned provider text | none |
| Gateway | loopback HTTP status, skills, task routing | local process only |
| Workspace | contain paths and create local directories | local directories |

## Actual provider behavior

- Gemini is represented by a handoff contract and manual steps.
- Flow is represented by a handoff contract and manual steps for video/motion tasks.
- There is no automatic browser navigation, prompt submission, provider polling, or download implementation in the extracted runtime.
- A configured browser_context is only a local label. It is not a browser profile path, cookie jar, or authentication record.

## Skill interaction

The source implementation uses a main runtime/Codex orchestration pattern rather than direct Skill-to-Skill calls. In this distribution:

~~~text
Skill A
  -> returns a route or handoff data
  -> caller/Codex creates a follow-up task
  -> Skill B is discovered and routed independently
~~~

A Skill does not import or execute another Skill. The manifest may declare dependencies for validation and documentation, but dependency execution is not automatic.

## Integrity and safety envelope

Every route and handoff carries:

~~~yaml
execution_allowed: false
browser_automation: false
credentials_stored: false
provider_calls: 0
quota_usage: 0
submission_mode: HUMAN_COPY_ONLY
~~~

