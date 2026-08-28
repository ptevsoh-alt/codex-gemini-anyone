# Troubleshooting

## CONFIG_REQUIRED

Run the setup script and confirm that at least one local configuration file exists in config/. The example files are not loaded automatically as user configuration.

## ACCOUNT_UNAVAILABLE

Check that an enabled account declares the provider and task type required by the request. For example, a Flow video route needs FLOW in capabilities and VIDEO in task_types.

## SKILL_ROUTE_AMBIGUOUS

Two Skills matched the same number of trigger terms. Set skill_id explicitly in the task or make triggers more specific.

## SKILL_NOT_FOUND

Confirm the directory contains manifest.yaml, manifest.yml, or manifest.json, and that the manifest ID matches the requested skill_id.

## OUTPUT_REQUIRED

The output parser receives a local string. Read the provider result from a local file and pass its content to parse_output.

## Gateway does not start

Only 127.0.0.1 is allowed. Check that port 4318 is free, or set CODEX_GEMINI_PORT to another local port.

## Provider login problems

Login is intentionally manual. Do not solve login issues by exporting or copying cookies, sessions, login databases, or browser user-data directories. Re-authenticate in the user's own browser context.

## Security scan failure

Remove the offending local identity or secret-shaped value. Do not weaken the scan or commit the file.

