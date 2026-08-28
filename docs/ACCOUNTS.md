# Accounts

## Logical account model

The runtime separates routing labels from real provider identity:

~~~text
Task capability
  -> logical account label
  -> local browser-context label
  -> human-selected provider session
~~~

An account record may declare:

- id
- enabled
- browser_context
- capabilities
- task_types

It must not declare or contain:

- email address
- password
- access or refresh token
- cookie or session export
- login database
- browser user-data directory

## Selection

Selection order:

1. An explicit account_id is honored and validated.
2. Otherwise the first enabled eligible account in configuration order is selected.
3. If no eligible account exists, routing returns ACCOUNT_UNAVAILABLE.

The Account Router does not inspect provider login health. The browser_context value is a label the human maps to their own browser setup.

## Multi-account use

Add multiple records to accounts.local.yaml. Use distinct logical IDs and local labels. The runtime does not copy or synchronize browser profiles. The user must sign in manually on each device.

## First-login checklist

- Create a browser context yourself.
- Sign in to the provider manually.
- Confirm the provider page works.
- Set the matching logical label locally.
- Run a route and handoff dry check.
- Keep all authentication state outside the repository.

