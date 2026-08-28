'use strict';

const { parseYamlSubset } = require('../common/yaml-subset');
const { contains_secret } = require('../common/portable-security');

const PROVIDERS = new Set(['GEMINI', 'GEMINI_IMAGE', 'FLOW', 'GEMINI_GEM']);

function validate_accounts(document) {
  const errors = [];
  if (!document || !Array.isArray(document.accounts)) return { status: 'ACCOUNT_CONFIG_INVALID', errors: [{ code: 'ACCOUNTS_ARRAY_REQUIRED' }] };
  for (const account of document.accounts) {
    if (!/^[a-z][a-z0-9_-]{1,63}$/.test(account.id ?? '')) errors.push({ code: 'ACCOUNT_ID_INVALID', id: account.id });
    if (account.enabled !== false && typeof account.enabled !== 'boolean') errors.push({ code: 'ACCOUNT_ENABLED_INVALID', id: account.id });
    if (account.capabilities && (!Array.isArray(account.capabilities) || account.capabilities.some((item) => !PROVIDERS.has(String(item).toUpperCase())))) {
      errors.push({ code: 'ACCOUNT_CAPABILITIES_INVALID', id: account.id });
    }
    if (contains_secret(account)) errors.push({ code: 'ACCOUNT_SECRET_OR_IDENTITY_FORBIDDEN', id: account.id });
  }
  return errors.length ? { status: 'ACCOUNT_CONFIG_INVALID', errors } : { status: 'PASS' };
}

function load_accounts(filePath) {
  const fs = require('node:fs');
  try {
    const source = fs.readFileSync(filePath, 'utf8');
    const document = filePath.endsWith('.json') ? JSON.parse(source) : parseYamlSubset(source);
    const validation = validate_accounts(document);
    return validation.status === 'PASS' ? { status: 'PASS', accounts: document.accounts } : validation;
  } catch (error) {
    return { status: 'ACCOUNT_CONFIG_REQUIRED', errors: [{ code: error.message }] };
  }
}

function choose_account(accounts, task = {}) {
  const provider = String(task.provider ?? '').toUpperCase();
  const capability = String(task.capability ?? '').toUpperCase();
  const eligible = accounts.filter((item) => item.enabled !== false
    && (!provider || (item.capabilities ?? []).map(String).map((v) => v.toUpperCase()).includes(provider))
    && (!capability || (item.task_types ?? []).map(String).map((v) => v.toUpperCase()).includes(capability)));
  if (task.account_id) {
    const found = eligible.find((item) => item.id === task.account_id);
    return found ? { status: 'PASS', account: found, selection_mode: 'EXPLICIT_ACCOUNT' } : { status: 'ACCOUNT_UNAVAILABLE', errors: [{ code: 'EXPLICIT_ACCOUNT_NOT_ELIGIBLE' }] };
  }
  return eligible.length ? { status: 'PASS', account: eligible[0], selection_mode: 'CONFIG_ORDER' } : { status: 'ACCOUNT_UNAVAILABLE', errors: [{ code: 'NO_ELIGIBLE_ACCOUNT' }] };
}

module.exports = { PROVIDERS, validate_accounts, load_accounts, choose_account };

