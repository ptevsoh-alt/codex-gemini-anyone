'use strict';

const { hashCanonical } = require('../common/canonical-json');
const { choose_account } = require('../account-router');

const DEFAULT_PROVIDERS = Object.freeze({
  TEXT: 'GEMINI',
  BLOG: 'GEMINI',
  SEO: 'GEMINI',
  IMAGE: 'GEMINI_IMAGE',
  VIDEO: 'FLOW',
  MOTION: 'FLOW'
});

function task_capability(task) {
  const raw = String(task?.capability ?? task?.type ?? task ?? '').toUpperCase();
  if (raw.includes('MOTION')) return 'MOTION';
  if (raw.includes('VIDEO')) return 'VIDEO';
  if (raw.includes('IMAGE') || raw.includes('VISUAL')) return 'IMAGE';
  if (raw.includes('SEO')) return 'SEO';
  if (raw.includes('BLOG') || raw.includes('TEXT') || raw.includes('CONTENT')) return 'BLOG';
  return 'TEXT';
}

function resolve_route(task, config = {}) {
  const capability = task_capability(task);
  const gem = task?.gem_id ? (config.gems ?? []).find((item) => item.id === task.gem_id) : null;
  if (task?.gem_id && !gem) return { status: 'GEM_NOT_FOUND', errors: [{ code: 'EXPLICIT_GEM_NOT_FOUND' }] };
  const requestedProvider = String(task?.provider ?? '').toUpperCase();
  const provider = requestedProvider || String(gem?.provider ?? '').toUpperCase() || DEFAULT_PROVIDERS[capability] || 'GEMINI';
  const accounts = Array.isArray(config.accounts) ? config.accounts : [];
  const accountResult = choose_account(accounts, { ...task, provider, capability });
  if (accountResult.status !== 'PASS') return accountResult;
  const account = accountResult.account;
  if (gem && gem.account_id && gem.account_id !== account.id) return { status: 'GEM_ACCOUNT_MISMATCH', errors: [{ code: 'GEM_ACCOUNT_MISMATCH' }] };
  const route = {
    schema_version: '1.0.0',
    route_id: 'GMR-' + hashCanonical({ task_id: task?.task_id, account: account.id, gem: gem?.id ?? null, provider, capability }).slice(7, 19).toUpperCase(),
    task_id: task?.task_id ?? null,
    capability,
    provider,
    account_id: account.id,
    gem_id: gem?.id ?? null,
    gem_display_name: gem?.display_name ?? null,
    browser_context: account.browser_context ?? null,
    selection_mode: gem ? 'EXPLICIT_ACCOUNT_AND_GEM' : accountResult.selection_mode,
    submission_mode: 'HUMAN_COPY_ONLY',
    execution_allowed: false,
    browser_automation: false,
    credentials_stored: false,
    quota_usage: 0
  };
  route.route_hash = hashCanonical(route);
  return { status: 'PASS', route };
}

module.exports = { DEFAULT_PROVIDERS, task_capability, resolve_route };
