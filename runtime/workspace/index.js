'use strict';

const fs = require('node:fs');
const path = require('node:path');

function normalize_workspace_root(workspaceRoot) {
  const value = String(workspaceRoot ?? '').trim();
  if (!value) throw new Error('WORKSPACE_ROOT_REQUIRED');
  return path.resolve(value);
}

function resolve_workspace_path(workspaceRoot, ...segments) {
  const root = normalize_workspace_root(workspaceRoot);
  const candidate = path.resolve(root, ...segments);
  const relative = path.relative(root, candidate);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('WORKSPACE_PATH_OUTSIDE_ROOT');
  }
  return candidate;
}

function initialize_workspace(workspaceRoot) {
  try {
    const root = normalize_workspace_root(workspaceRoot);
    fs.mkdirSync(root, { recursive: true });

    const stateRoot = resolve_workspace_path(root, '.codex-gemini');
    const tasks = resolve_workspace_path(root, '.codex-gemini', 'tasks');
    const handoffs = resolve_workspace_path(root, '.codex-gemini', 'handoffs');
    const outputs = resolve_workspace_path(root, '.codex-gemini', 'outputs');

    for (const directory of [stateRoot, tasks, handoffs, outputs]) {
      fs.mkdirSync(directory, { recursive: true });
    }

    return {
      status: 'PASS',
      workspace_root: root,
      state_root: stateRoot,
      paths: { tasks, handoffs, outputs }
    };
  } catch (error) {
    return {
      status: 'WORKSPACE_INVALID',
      errors: [{ code: error.message }]
    };
  }
}

module.exports = { initialize_workspace, resolve_workspace_path };
