'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const { discover_skills } = require('../runtime/skill-loader');
const { create_task, route_task } = require('../runtime/task-router');
const { create_handoff } = require('../runtime/provider-handoff');
const { resolve_route } = require('../runtime/gem-router');
const { parse_output } = require('../runtime/output-parser');
const { initialize_workspace } = require('../runtime/workspace');

test('example skill is discoverable and routable', () => {
  const found = discover_skills(path.join(root, 'skills'));
  assert.equal(found.status, 'PASS');
  assert.equal(found.skills.some((item) => item.skill_id === 'example.general'), true);
  const task = create_task('summarize this example handoff request');
  const routed = route_task(task.task, { skills_root: path.join(root, 'skills'), config: {
    accounts: [{ id: 'account_01', enabled: true, browser_context: 'local-browser-profile-01', capabilities: ['GEMINI'], task_types: ['BLOG'] }],
    gems: []
  }});
  assert.equal(routed.status, 'PASS');
  assert.equal(routed.next, 'HUMAN_HANDOFF');
});

test('explicit account and gem are preserved', () => {
  const result = resolve_route({ task_id: 'TASK-EXPLICIT', capability: 'BLOG', account_id: 'account_01', gem_id: 'gem_01' }, {
    accounts: [{ id: 'account_01', enabled: true, browser_context: 'local-browser-profile-01', capabilities: ['GEMINI_GEM'], task_types: ['BLOG'] }],
    gems: [{ id: 'gem_01', display_name: 'Example Gem', account_id: 'account_01', provider: 'GEMINI_GEM', capabilities: ['BLOG'] }]
  });
  assert.equal(result.status, 'PASS');
  assert.equal(result.route.selection_mode, 'EXPLICIT_ACCOUNT_AND_GEM');
  assert.equal(result.route.execution_allowed, false);
});

test('missing local config is explicit', () => {
  const result = require('../runtime/config-loader').load_config({ config_root: path.join(os.tmpdir(), 'codex-gemini-missing-' + Date.now()) });
  assert.equal(result.status, 'CONFIG_REQUIRED');
});

test('workspace paths are initialized and contained', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-gemini-workspace-'));
  const result = initialize_workspace(dir);
  assert.equal(result.status, 'PASS');
  assert.equal(fs.existsSync(path.join(dir, '.codex-gemini', 'tasks')), true);
});

test('handoff is human-only and provider counters remain zero', () => {
  const task = create_task('create a short blog draft');
  const route = resolve_route(task.task, {
    accounts: [{ id: 'account_01', enabled: true, browser_context: 'local-browser-profile-01', capabilities: ['GEMINI'], task_types: ['BLOG'] }],
    gems: []
  });
  const handoff = create_handoff(task.task, { route_hash: 'sha256:' + 'a'.repeat(64), skill_id: 'example.general', skill_version: '1.0.0' }, route.route, { prompt: task.task.request });
  assert.equal(handoff.status, 'PASS');
  assert.equal(handoff.handoff.execution_allowed, false);
  assert.equal(handoff.handoff.provider_calls, 0);
  assert.equal(handoff.handoff.submission_mode, 'HUMAN_COPY_ONLY');
});

test('output parser keeps source content unchanged', () => {
  const result = parse_output('[BLOG]\\nHello\\n[IMAGE_MARKDOWN]\\n![x](x.png)');
  assert.equal(result.status, 'PASS');
  assert.equal(result.content_rewritten, false);
  assert.equal(result.assets.length, 1);
});

