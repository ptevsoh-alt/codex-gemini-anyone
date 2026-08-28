#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { load_config } = require('../runtime/config-loader');
const { discover_skills } = require('../runtime/skill-loader');
const { create_task, route_task } = require('../runtime/task-router');
const { create_handoff } = require('../runtime/provider-handoff');
const { create_gateway } = require('../runtime/gateway');
const { parseYamlSubset } = require('../runtime/common/yaml-subset');

const root = path.resolve(__dirname, '..');
const configRoot = process.env.CODEX_GEMINI_CONFIG_DIR
  ? path.resolve(process.env.CODEX_GEMINI_CONFIG_DIR)
  : path.join(root, 'config');
const skillsRoot = process.env.CODEX_GEMINI_SKILLS
  ? path.resolve(process.env.CODEX_GEMINI_SKILLS)
  : path.join(root, 'skills');

function print(value) { process.stdout.write(JSON.stringify(value, null, 2) + '\n'); }
function localConfig() {
  const result = load_config({ config_root: configRoot });
  if (result.status !== 'PASS') return result;
  const read = (file) => {
    if (!fs.existsSync(file)) return {};
    const text = fs.readFileSync(file, 'utf8');
    return file.endsWith('.json') ? JSON.parse(text) : parseYamlSubset(text);
  };
  return {
    status: 'PASS',
    config: {
      ...result.config,
      ...read(path.join(configRoot, 'accounts.local.yaml')),
      ...read(path.join(configRoot, 'gems.local.yaml'))
    }
  };
}

async function main(argv) {
  const [command, ...args] = argv;
  if (command === 'skills' && args[0] === 'list') return print(discover_skills(skillsRoot));
  if (command === 'route') {
    const request = args.join(' ') || process.env.CODEX_GEMINI_REQUEST;
    const config = localConfig();
    if (config.status !== 'PASS') return print(config);
    const task = create_task(request, {});
    return print(task.status === 'PASS' ? route_task(task.task, { config: config.config, skills_root: skillsRoot }) : task);
  }
  if (command === 'handoff') {
    const request = args.join(' ') || process.env.CODEX_GEMINI_REQUEST;
    const config = localConfig();
    if (config.status !== 'PASS') return print(config);
    const task = create_task(request, {});
    if (task.status !== 'PASS') return print(task);
    const routed = route_task(task.task, { config: config.config, skills_root: skillsRoot });
    if (routed.status !== 'PASS') return print(routed);
    return print(create_handoff(task.task, routed.skill_route, routed.gem_route, { prompt: request }));
  }
  if (command === 'start') {
    const config = localConfig();
    if (config.status !== 'PASS') return print(config);
    const gateway = create_gateway({ config: config.config, skills_root: skillsRoot, workspace_root: process.env.CODEX_GEMINI_WORKSPACE });
    await gateway.start(Number(process.env.CODEX_GEMINI_PORT || 4318));
    process.stdout.write('codex-gemini-anyone listening on http://127.0.0.1:' + (process.env.CODEX_GEMINI_PORT || 4318) + '\n');
    return;
  }
  print({ status: 'USAGE', commands: ['skills list', 'route <request>', 'handoff <request>', 'start'] });
}

main(process.argv.slice(2)).catch((error) => { print({ status: 'ERROR', code: error.message }); process.exitCode = 1; });
