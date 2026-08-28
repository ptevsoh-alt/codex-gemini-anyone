'use strict';

const { hashCanonical } = require('../common/canonical-json');
const { parse_output } = require('../output-parser');

function analyze_markdown(markdown) {
  const source = String(markdown ?? '');
  if (!source.trim()) return { status: 'VALIDATION_ERROR', errors: [{ code: 'MARKDOWN_REQUIRED' }] };
  const markers = ['BLOG', 'SEO', 'IMAGE', 'VIDEO'].filter((marker) => source.toUpperCase().includes('[' + marker));
  const capability = /video|motion|视频|分镜/i.test(source) ? 'VIDEO'
    : /image|visual|photo|图片|视觉/i.test(source) ? 'IMAGE'
      : /seo|keyword|organic|搜索|关键词/i.test(source) ? 'SEO' : 'BLOG';
  return { status: 'PASS', source_hash: hashCanonical({ source }), markers, capability, planning_only: true };
}

function make_children(task, analysis) {
  const types = analysis.capability === 'BLOG' ? ['BLOG'] : [analysis.capability];
  return types.map((capability, index) => ({
    task_id: 'CHILD-' + hashCanonical({ parent: task.task_id, capability }).slice(7, 19).toUpperCase(),
    parent_task_id: task.task_id,
    capability,
    status: 'WAITING_HUMAN_APPROVAL',
    sequence: index + 1,
    execution_allowed: false
  }));
}

function parse_returned_output(output, expected = {}) {
  const parsed = parse_output(output);
  if (parsed.status !== 'PASS') return parsed;
  if (expected.task_id && !String(output).includes(expected.task_id) && expected.require_task_id) {
    return { status: 'VALIDATION_ERROR', errors: [{ code: 'OUTPUT_TASK_ID_MISSING' }] };
  }
  return parsed;
}

module.exports = { analyze_markdown, make_children, parse_returned_output };

