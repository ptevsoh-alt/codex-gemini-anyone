# Installation

## Requirements

- Windows 10/11 PowerShell or a POSIX shell
- Node.js 18 or newer
- Git
- A browser where the user can manually sign in to Gemini and/or Flow

The runtime has no third-party npm dependency.

## Windows

~~~powershell
git clone https://github.com/ptevsoh-alt/codex-gemini-anyone.git
cd codex-gemini-anyone
.\scripts\setup.ps1
npm test
npm run security:scan
~~~

Edit:

~~~text
config/accounts.local.yaml
config/gems.local.yaml
config/paths.local.yaml
~~~

Use logical labels for accounts and browser contexts. Sign in manually in the corresponding browser context. Never export or copy cookies, sessions, login databases, or browser user-data directories.

Run:

~~~powershell
node .\bin\codex-gemini.js skills list
node .\bin\codex-gemini.js route "create a short image prompt"
node .\bin\codex-gemini.js handoff "create a short video storyboard"
~~~

Start the loopback Gateway:

~~~powershell
node .\bin\codex-gemini.js start
~~~

It binds only to 127.0.0.1.

## macOS / Linux

~~~sh
git clone https://github.com/ptevsoh-alt/codex-gemini-anyone.git
cd codex-gemini-anyone
sh ./scripts/setup.sh
npm test
npm run security:scan
~~~

## New-device sequence

1. Clone the repository.
2. Run the platform setup script.
3. Edit local configuration files.
4. Manually sign in to the provider in the user's own browser context.
5. Run tests and list Skills.
6. Route a task.
7. Create a handoff package.
8. Execute the provider step manually.
9. Save the returned output to the configured local output directory.
10. Parse and validate the returned output.

Setup never imports authentication state.

