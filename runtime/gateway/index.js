'use strict';

const http = require('node:http');
const { load_config } = require('../config-loader');
const { initialize_workspace } = require('../workspace');
const { create_task, route_task } = require('../task-router');
const { discover_skills } = require('../skill-loader');

function create_gateway(options = {}) {
  const host = options.host ?? '127.0.0.1';
  if (host !== '127.0.0.1') throw new Error('LOOPBACK_ONLY');
  const workspaceRoot = options.workspace_root;
  const config = options.config ?? {};
  const skillsRoot = options.skills_root;
  const tasks = new Map();
  const server = http.createServer(async (req, res) => {
    const send = (status, body) => { const data = Buffer.from(JSON.stringify(body)); res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'}); res.end(data); };
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'GET' && url.pathname === '/status') {
      return send(200, { status:'PASS', runtime:'codex-gemini-anyone', bind_host:host, execution_allowed:false, browser_automation:false, provider_calls:0, quota_usage:0 });
    }
    if (req.method === 'GET' && url.pathname === '/skills') return send(200, discover_skills(skillsRoot));
    if (req.method === 'POST' && url.pathname === '/task/create') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; if (body.length > 1048576) req.destroy(); });
      req.on('end', () => {
        try {
          const input = JSON.parse(body);
          const created = create_task(input.request, input);
          if (created.status !== 'PASS') return send(422, created);
          const routed = route_task(created.task, { config, skills_root: skillsRoot });
          if (routed.status !== 'PASS') return send(422, routed);
          tasks.set(created.task.task_id, { ...created, ...routed });
          return send(201, { status:'PASS', task_id:created.task.task_id, next:'HUMAN_HANDOFF', execution_allowed:false });
        } catch (error) { return send(400, {status:'ERROR', code:error.message}); }
      });
      return;
    }
    const match = url.pathname.match(/^\/task\/status\/([^/]+)$/);
    if (req.method === 'GET' && match) return send(tasks.has(match[1]) ? 200 : 404, tasks.get(match[1]) ?? {status:'NOT_FOUND'});
    return send(404, {status:'NOT_FOUND'});
  });
  return {
    server,
    start(port = 4318) { return new Promise((resolve, reject) => server.listen(port, host, () => resolve(server.address())).once('error', reject)); },
    stop() { return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); },
    workspace: workspaceRoot ? initialize_workspace(workspaceRoot) : null
  };
}

function load_runtime(options = {}) {
  const configResult = options.config ? { status:'PASS', config: options.config } : load_config(options);
  return configResult.status === 'PASS' ? { status:'PASS', config:configResult.config, gateway:create_gateway({...options, config:configResult.config}) } : configResult;
}

module.exports = { create_gateway, load_runtime };

