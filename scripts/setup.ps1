$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 18 or newer is required' }
New-Item -ItemType Directory -Force -Path '.local', 'workspace', 'downloads', 'output' | Out-Null
if (-not (Test-Path 'config/accounts.local.yaml')) { Copy-Item 'config/accounts.example.yaml' 'config/accounts.local.yaml' }
if (-not (Test-Path 'config/gems.local.yaml')) { Copy-Item 'config/gems.example.yaml' 'config/gems.local.yaml' }
if (-not (Test-Path 'config/paths.local.yaml')) { Copy-Item 'config/paths.example.yaml' 'config/paths.local.yaml' }
Write-Host 'Setup complete. Edit local account and Gem labels, then run npm test.'
Write-Host 'Sign in manually in your own browser profile. Do not import cookies or browser data.'

