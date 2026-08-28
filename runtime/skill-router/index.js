'use strict';

const { hashCanonical } = require('../common/canonical-json');
const { discover_skills } = require('../skill-loader');

function normalize(value) { return String(value ?? '').trim().toLowerCase(); }

function route_skill(task, skillsRoot) {
  const discovered = discover_skills(skillsRoot);
  if (discovered.status !== 'PASS') return discovered;
  const requested = task?.skill_id ? discovered.skills.find((skill) => skill.skill_id === task.skill_id) : null;
  if (task?.skill_id && !requested) return { status: 'SKILL_NOT_FOUND', errors: [{ code: 'EXPLICIT_SKILL_NOT_FOUND', skill_id: task.skill_id }] };
  if (requested) return makeRoute(task, requested, 'EXPLICIT');
  const text = normalize([task?.objective, task?.type, task?.prompt, task?.request].filter(Boolean).join(' '));
  const scored = discovered.skills.map((skill) => ({
    skill,
    score: (skill.triggers ?? []).reduce((score, trigger) => score + (text.includes(normalize(trigger)) ? 1 : 0), 0)
  })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.skill.skill_id.localeCompare(b.skill.skill_id));
  if (scored.length === 0) return { status: 'NO_SKILL_ROUTE', errors: [{ code: 'NO_SKILL_MATCH' }] };
  if (scored.length > 1 && scored[0].score === scored[1].score) {
    return { status: 'SKILL_ROUTE_AMBIGUOUS', errors: [{ code: 'EXPLICIT_SKILL_REQUIRED', candidates: scored.filter((item) => item.score === scored[0].score).map((item) => item.skill.skill_id) }] };
  }
  return makeRoute(task, scored[0].skill, 'TRIGGER');
}

function makeRoute(task, skill, selectionMode) {
  const route = {
    schema_version: '1.0.0',
    route_id: 'SKR-' + hashCanonical({ task, skill: skill.skill_id }).slice(7, 19).toUpperCase(),
    task_id: task?.task_id ?? null,
    skill_id: skill.skill_id,
    skill_version: skill.version,
    skill_root: skill.root,
    selection_mode: selectionMode,
    input_contract: skill.input ?? {},
    output_contract: skill.output ?? {},
    dependencies: skill.dependencies ?? [],
    execution_mode: skill.execution_mode ?? 'HANDOFF_ONLY',
    execution_allowed: false
  };
  route.route_hash = hashCanonical(route);
  return { status: 'PASS', route };
}

module.exports = { route_skill };
