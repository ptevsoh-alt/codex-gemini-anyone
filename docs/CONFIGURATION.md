# Configuration

Local configuration is split by concern. The example files are safe templates; copy them to .local.yaml names before editing.

## Runtime

config/config.local.yaml

~~~yaml
runtime_mode: HANDOFF_ONLY
default_provider_text: GEMINI
default_provider_image: GEMINI_IMAGE
default_provider_video: FLOW
~~~

## Accounts

config/accounts.local.yaml

~~~yaml
accounts:
  - id: account_01
    enabled: true
    browser_context: local-browser-profile-01
    capabilities: [GEMINI, GEMINI_IMAGE]
    task_types: [TEXT, BLOG, SEO, IMAGE]
~~~

id and browser_context are logical labels. They do not contain an email, path, cookie, session, or exported browser data.

## Gems

config/gems.local.yaml

~~~yaml
gems:
  - id: gem_01
    display_name: My Text Gem
    account_id: account_01
    provider: GEMINI_GEM
    capabilities: [TEXT, BLOG, SEO]
~~~

A Gem is optional. If gem_id is present in a task, it must exist and match the selected account. If it is absent, the configured provider default is used and the handoff states that no specific Gem was selected.

## Paths

config/paths.local.yaml

~~~yaml
workspace_root: ./workspace
skills_root: ./skills
downloads_root: ./downloads
output_root: ./output
~~~

These roots are local to the device and are ignored by Git. Environment variables can override the default locations:

~~~text
CODEX_GEMINI_CONFIG_DIR
CODEX_GEMINI_WORKSPACE
CODEX_GEMINI_SKILLS
CODEX_GEMINI_PORT
~~~

## Task options

A task may provide:

~~~json
{
  "account_id": "account_01",
  "gem_id": "gem_01",
  "provider": "GEMINI_GEM",
  "skill_id": "example.general"
}
~~~

Explicit selections are preserved. An explicit account or Gem that cannot be validated fails closed.

