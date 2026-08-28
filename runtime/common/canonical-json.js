'use strict';

const crypto = require('node:crypto');

function canonicalize(value) {
  if (value === null) return 'null';

  const type = typeof value;
  if (type === 'string' || type === 'boolean') return JSON.stringify(value);

  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('Canonical JSON does not support non-finite numbers');
    }
    return Object.is(value, -0) ? '0' : JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }

  if (type === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError('Canonical JSON accepts plain objects only');
    }

    const entries = Object.keys(value)
      .sort()
      .map((key) => {
        if (value[key] === undefined) {
          throw new TypeError(`Canonical JSON does not support undefined at key ${key}`);
        }
        return `${JSON.stringify(key)}:${canonicalize(value[key])}`;
      });
    return `{${entries.join(',')}}`;
  }

  throw new TypeError(`Canonical JSON does not support ${type}`);
}

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}

function hashCanonical(value) {
  return sha256(canonicalize(value));
}

module.exports = {
  canonicalize,
  hashCanonical,
  sha256,
};


