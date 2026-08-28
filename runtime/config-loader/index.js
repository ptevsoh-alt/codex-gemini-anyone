'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseYamlSubset } = require('../common/yaml-subset');
const { assert_public_config } = require('../common/portable-security');

function load_document(filePath) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    return { status: 'CONFIG_REQUIRED', errors: [{ code: 'CONFIG_FILE_NOT_FOUND', path: absolute }] };
  }
  try {
    const text = fs.readFileSync(absolute, 'utf8');
    const extension = path.extname(absolute).toLowerCase();
    const value = extension === '.json' ? JSON.parse(text) : parseYamlSubset(text);
    assert_public_config(value);
    return { status: 'PASS', path: absolute, value };
  } catch (error) {
    return { status: 'CONFIG_INVALID', errors: [{ code: error.message }] };
  }
}

function merge_configuments(documents) {
  const result = {};
  for (const document of documents) {
    if (document?.status !== 'PASS') return document;
    Object.assign(result, document.value);
  }
  return { status: 'PASS', config: result };
}

function load_config(options = {}) {
  const configRoot = path.resolve(options.config_root ?? process.env.CODEX_GEMINI_CONFIG_DIR ?? path.join(process.cwd(), 'config'));
  const names = options.files ?? ['config.local.yaml', 'accounts.local.yaml', 'gems.local.yaml', 'paths.local.yaml'];
  const documents = names.map((name) => load_document(path.join(configRoot, name)));
  const missing = documents.filter((item) => item.status === 'CONFIG_REQUIRED');
  if (missing.length === documents.length) {
    return { status: 'CONFIG_REQUIRED', config_root: configRoot, errors: [{ code: 'LOCAL_CONFIG_REQUIRED', config_root: configRoot }] };
  }
  const available = documents.filter((item) => item.status === 'PASS');
  const invalid = documents.filter((item) => !['PASS', 'CONFIG_REQUIRED'].includes(item.status));
  if (invalid.length) return invalid[0];
  const merged = merge_configuments(available);
  return { ...merged, config_root: configRoot, missing: missing.map((item) => item.errors[0].path) };
}

module.exports = { load_document, load_config };

