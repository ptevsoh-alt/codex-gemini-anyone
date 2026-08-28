'use strict';

const GOOGLE_IDENTITY = /[A-Za-z0-9._%+-]+@(?:gmail|googlemail)\.com/i;
const SECRET_VALUE = /(?:^|[\s"'=])(sk-[A-Za-z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i;
const FORBIDDEN_FIELD = /(?:password|access[_-]?token|refresh[_-]?token|api[_-]?key|cookie|session[_-]?data|credential|secret)/i;

function contains_secret(value, key = '') {
  if (typeof value === 'string') {
    return GOOGLE_IDENTITY.test(value) || SECRET_VALUE.test(value);
  }
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([childKey, child]) => (
    FORBIDDEN_FIELD.test(childKey) && typeof child === 'string'
      ? String(child).trim() !== ''
      : contains_secret(child, childKey)
  ));
}

function assert_public_config(value) {
  if (contains_secret(value)) {
    throw new Error('PUBLIC_CONFIG_SECRET_OR_IDENTITY_FOUND');
  }
  return value;
}

function normalize_remote(remote) {
  return String(remote ?? '').trim().replace(/\\/g, '/').replace(/\/$/, '').replace(/\.git$/i, '').toLowerCase();
}

module.exports = { contains_secret, assert_public_config, normalize_remote };

