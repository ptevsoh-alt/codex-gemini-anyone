'use strict';

const { hashCanonical } = require('../common/canonical-json');

function create_handoff(task, skillRoute, gemRoute, options = {}) {
  if (!task?.task_id || !skillRoute?.route_hash || !gemRoute?.route_hash) {
    return { status: 'VALIDATION_ERROR', errors: [{ code: 'HANDOFF_CONTEXT_REQUIRED' }] };
  }
  const provider = gemRoute.provider;
  const content = String(options.prompt ?? task.request ?? '').trim();
  if (!content) return { status: 'VALIDATION_ERROR', errors: [{ code: 'PROMPT_REQUIRED' }] };
  const handoff = {
    schema_version: '1.0.0',
    handoff_id: 'HOF-' + hashCanonical({ task: task.task_id, skill: skillRoute.route_hash, gem: gemRoute.route_hash, content }).slice(7, 19).toUpperCase(),
    task_id: task.task_id,
    capability: task.capability,
    provider,
    account_id: gemRoute.account_id,
    gem_id: gemRoute.gem_id,
    browser_context: gemRoute.browser_context,
    skill_id: skillRoute.skill_id,
    skill_version: skillRoute.skill_version,
    prompt: content,
    input_files: options.input_files ?? [],
    output_directory: options.output_directory ?? null,
    submission_mode: 'HUMAN_COPY_ONLY',
    human_steps: provider === 'FLOW'
      ? ['OPEN_FLOW_MANUALLY', 'SELECT_CONFIGURED_ACCOUNT_MANUALLY', 'OPTIONALLY_SELECT_GEM_MANUALLY', 'COPY_PROMPT_MANUALLY', 'DOWNLOAD_RESULT_TO_OUTPUT_DIRECTORY']
      : ['OPEN_GEMINI_MANUALLY', 'SELECT_CONFIGURED_ACCOUNT_MANUALLY', 'OPTIONALLY_OPEN_GEM_MANUALLY', 'COPY_PROMPT_MANUALLY', 'SAVE_RESULT_TO_OUTPUT_DIRECTORY'],
    execution_allowed: false,
    browser_automation: false,
    credentials_stored: false,
    provider_calls: 0,
    quota_usage: 0,
    result_status: 'WAITING_HUMAN_OUTPUT'
  };
  handoff.prompt_hash = hashCanonical({ prompt: content });
  handoff.handoff_hash = hashCanonical(handoff);
  return { status: 'PASS', handoff };
}

module.exports = { create_handoff };

