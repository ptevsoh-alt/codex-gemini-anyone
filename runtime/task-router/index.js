'use strict';

const { hashCanonical } = require('../common/canonical-json');
const { route_skill } = require('../skill-router');
const { resolve_route } = require('../gem-router');

function classify(request) {
  const text = String(request ?? '').trim();
  if (!text) return { status: 'VALIDATION_ERROR', errors: [{ code: 'REQUEST_REQUIRED' }] };
  const lower = text.toLowerCase();
  const capability = /video|motion|视频|动态|分镜/.test(lower) ? 'VIDEO'
    : /image|visual|photo|图片|视觉|海报/.test(lower) ? 'IMAGE'
      : /seo|keyword|organic|搜索|关键词/.test(lower) ? 'SEO' : 'BLOG';
  return { status: 'PASS', capability, request: text, planning_only: true };
}

function create_task(request, options = {}) {
  const classification = classify(request);
  if (classification.status !== 'PASS') return classification;
  const task = {
    schema_version: '1.0.0',
    task_id: options.task_id ?? 'TASK-' + hashCanonical({ request }).slice(7, 19).toUpperCase(),
    request,
    capability: options.capability ?? classification.capability,
    provider: options.provider ?? null,
    account_id: options.account_id ?? null,
    gem_id: options.gem_id ?? null,
    skill_id: options.skill_id ?? null,
    created_at: options.created_at ?? new Date().toISOString(),
    execution_allowed: false,
    provider_calls: 0,
    quota_usage: 0
  };
  task.task_hash = hashCanonical(task);
  return { status: 'PASS', task, classification };
}

function route_task(task, options = {}) {
  const skill = route_skill(task, options.skills_root);
  if (skill.status !== 'PASS') return skill;
  const gem = resolve_route(task, options.config);
  if (gem.status !== 'PASS') return gem;
  return { status: 'PASS', task, skill_route: skill.route, gem_route: gem.route, next: 'HUMAN_HANDOFF' };
}

module.exports = { classify, create_task, route_task };

