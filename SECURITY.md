# Security Policy

## Supported versions

The actively maintained public line is v0.1.x and the main branch.

## Security model

codex-gemini-anyone is designed to keep provider authentication and browser identity state outside the source tree. The runtime uses fail-closed execution metadata, workspace containment, integrity hashes, and a repository security scan to reduce accidental leakage or unsafe execution.

The security scan is a guardrail, not a guarantee that a repository or generated artifact contains no sensitive information.

## Reporting a vulnerability

Please do not publish credentials, tokens, cookies, session data, private browser-state exports, or working exploit secrets in a public issue.

If GitHub private vulnerability reporting is available for this repository, use it. Otherwise, open a minimal issue that describes the affected component and impact without sensitive exploit details, and request a private follow-up channel.

Helpful reports include:

- affected file or component
- expected vs. observed behavior
- minimal reproduction steps using non-sensitive data
- security impact
- suggested mitigation, if known

## Maintainer response

Security reports will be triaged based on reproducibility, impact, and whether the issue crosses a documented trust or identity boundary. Fixes should include regression coverage where practical.
