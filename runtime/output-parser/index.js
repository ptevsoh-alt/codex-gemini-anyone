'use strict';

const { hashCanonical } = require('../common/canonical-json');

const MARKERS = Object.freeze(['BLOG', 'SEO_METADATA', 'ALT_TEXT', 'CTA', 'CTA_SUGGESTION', 'IMAGE_MARKDOWN', 'VIDEO_MARKDOWN']);

function parse_section(source, marker, nextMarkers) {
  const startToken = '[' + marker + ']';
  const start = source.indexOf(startToken);
  if (start < 0) return null;
  const bodyStart = start + startToken.length;
  const offsets = nextMarkers.map((item) => source.indexOf('[' + item + ']', bodyStart)).filter((item) => item >= 0);
  const end = offsets.length ? Math.min(...offsets) : source.length;
  const content = source.slice(bodyStart, end).trim();
  return { marker, content, content_hash: hashCanonical({ content }), start, end };
}

function parse_output(original) {
  const source = String(original ?? '');
  if (!source.trim()) return { status: 'VALIDATION_ERROR', errors: [{ code: 'OUTPUT_REQUIRED' }] };
  const sections = {};
  MARKERS.forEach((marker) => {
    const parsed = parse_section(source, marker, MARKERS.filter((item) => item !== marker));
    if (parsed) sections[marker] = parsed;
  });
  const assets = ['IMAGE_MARKDOWN', 'VIDEO_MARKDOWN'].flatMap((marker) => {
    const section = sections[marker];
    return section?.content ? section.content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((value, index) => ({ type: marker, index: index + 1, value })) : [];
  });
  return {
    status: 'PASS',
    original_output: source,
    original_output_hash: hashCanonical({ source }),
    sections,
    assets,
    content_rewritten: false
  };
}

module.exports = { MARKERS, parse_output };

