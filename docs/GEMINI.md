# Gemini

## What is implemented

The runtime supports Gemini-oriented logical routing:

- text, blog, and SEO tasks default to GEMINI
- an explicitly configured Gem can use GEMINI_GEM
- account and Gem labels are preserved in a handoff
- returned Markdown can be parsed without rewriting its content

## What is not implemented

The extracted source contains no automatic browser driver. The runtime does not:

- open Gemini
- select an account
- select a Gem in the UI
- paste or submit a prompt
- poll generation
- download files
- read cookies or sessions

The user performs those actions manually in the browser.

## Handoff

node bin/codex-gemini.js handoff "..." returns a JSON contract containing:

- task and Skill IDs
- provider and logical Account
- optional Gem
- prompt hash
- input files
- output directory
- manual steps
- fixed safety counters

The contract is the bridge between Codex planning and the human-operated Gemini page.

