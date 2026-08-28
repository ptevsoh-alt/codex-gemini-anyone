'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseYamlSubset } = require('../common/yaml-subset');
const { assert_public_config } = require('../common/portable-security');

function readManifest(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const manifest = path.extname(filePath).toLowerCase() === '.json' ? JSON.parse(raw) : parseYamlSubset(raw);
    assert_public_config(manifest);
    if (!/^[a-z][a-z0-9._-]{1,63}$/.test(manifest.skill_id ?? '')) throw new Error('SKILL_ID_INVALID');
    if (!manifest.version || !manifest.description) throw new Error('SKILL_MANIFEST_REQUIRED_FIELDS');
    if (!Array.isArray(manifest.triggers) || !Array.isArray(manifest.capabilities)) throw new Error('SKILL_MANIFEST_LIST_FIELDS_REQUIRED');
    return { status: 'PASS', manifest, manifest_path: filePath };
  } catch (error) {
    return { status: 'SKILL_INVALID', errors: [{ code: error.message, path: filePath }] };
  }
}

function discover_skills(root) {
  const absoluteRoot = path.resolve(root);
  if (!fs.existsSync(absoluteRoot)) return { status: 'PASS', skills: [] };
  const skills = [];
  for (const entry of fs.readdirSync(absoluteRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(absoluteRoot, entry.name);
    const manifestName = ['manifest.yaml', 'manifest.yml', 'manifest.json'].find((name) => fs.existsSync(path.join(directory, name)));
    if (!manifestName) continue;
    const result = readManifest(path.join(directory, manifestName));
    if (result.status !== 'PASS') return result;
    skills.push({ ...result.manifest, root: directory, manifest_path: result.manifest_path, skill_md: path.join(directory, 'SKILL.md') });
  }
  return { status: 'PASS', skills: skills.sort((a, b) => a.skill_id.localeCompare(b.skill_id)) };
}

function get_skill(root, skillId) {
  const result = discover_skills(root);
  if (result.status !== 'PASS') return result;
  const skill = result.skills.find((item) => item.skill_id === skillId);
  return skill ? { status: 'PASS', skill } : { status: 'SKILL_NOT_FOUND', errors: [{ code: 'SKILL_NOT_FOUND', skill_id: skillId }] };
}

module.exports = { readManifest, discover_skills, get_skill };

