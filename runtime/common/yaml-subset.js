'use strict';

class YamlSubsetError extends Error {
  constructor(message, line = null) {
    super(line ? `${message} (line ${line})` : message);
    this.name = 'YamlSubsetError';
    this.line = line;
  }
}

function stripComment(text) {
  let single = false;
  let double = false;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (double && char === '\\' && !escaped) {
      escaped = true;
      continue;
    }
    if (char === '"' && !single && !escaped) double = !double;
    if (char === "'" && !double) single = !single;
    escaped = false;
    if (char === '#' && !single && !double && (index === 0 || /\s/.test(text[index - 1]))) {
      return text.slice(0, index).trimEnd();
    }
  }
  return text.trimEnd();
}

function splitKeyValue(text, line) {
  let single = false;
  let double = false;
  let escaped = false;
  let flowDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (double && char === '\\' && !escaped) {
      escaped = true;
      continue;
    }
    if (char === '"' && !single && !escaped) double = !double;
    if (char === "'" && !double) single = !single;
    escaped = false;
    if (single || double) continue;
    if (char === '[' || char === '{') flowDepth += 1;
    if (char === ']' || char === '}') flowDepth -= 1;
    if (char === ':' && flowDepth === 0) {
      const key = text.slice(0, index).trim();
      if (!key) throw new YamlSubsetError('Empty mapping key', line);
      return [key, text.slice(index + 1).trim()];
    }
  }
  return null;
}

function parseScalar(raw, line) {
  const value = raw.trim();
  if (value === '') return null;
  if (value === '|' || value === '>' || value.startsWith('|') || value.startsWith('>')) {
    throw new YamlSubsetError('Block scalars are not supported', line);
  }
  if (/^[&*!]/.test(value) || value === '<<') {
    throw new YamlSubsetError('YAML anchors, aliases, tags and merge keys are not supported', line);
  }
  if (value.startsWith('[') || value.startsWith('{') || value.startsWith('"')) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new YamlSubsetError(`Invalid JSON-compatible flow value: ${error.message}`, line);
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      throw new YamlSubsetError('Unterminated single-quoted scalar', line);
    }
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^-?(?:0|[1-9]\d*)$/.test(value)) return Number.parseInt(value, 10);
  if (/^-?(?:0|[1-9]\d*)\.\d+(?:[eE][+-]?\d+)?$/.test(value)) return Number(value);
  return value;
}

function normalizeKey(raw, line) {
  const key = parseScalar(raw, line);
  if (typeof key !== 'string' || key.length === 0) {
    throw new YamlSubsetError('Mapping keys must be non-empty strings', line);
  }
  if (key === '<<') throw new YamlSubsetError('YAML merge keys are not supported', line);
  return key;
}

function parseYamlSubset(source) {
  if (typeof source !== 'string') throw new TypeError('YAML source must be a string');

  const lines = [];
  const rawLines = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  rawLines.forEach((raw, offset) => {
    if (/^\s*%/.test(raw)) throw new YamlSubsetError('YAML directives are not supported', offset + 1);
    if (/^\s*(---|\.\.\.)\s*$/.test(raw)) return;
    const match = raw.match(/^(\s*)/);
    const leading = match ? match[1] : '';
    if (leading.includes('\t')) throw new YamlSubsetError('Tabs are not allowed for indentation', offset + 1);
    const withoutComment = stripComment(raw);
    if (!withoutComment.trim()) return;
    const indent = withoutComment.length - withoutComment.trimStart().length;
    lines.push({ indent, text: withoutComment.trimStart(), line: offset + 1 });
  });

  if (lines.length === 0) return {};

  function addKey(target, key, value, line) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      throw new YamlSubsetError(`Duplicate mapping key ${key}`, line);
    }
    target[key] = value;
  }

  function parseBlock(start, indent) {
    if (start >= lines.length) return [{}, start];
    if (lines[start].indent !== indent) {
      throw new YamlSubsetError(`Unexpected indentation ${lines[start].indent}; expected ${indent}`, lines[start].line);
    }
    return lines[start].text.startsWith('-') ? parseSequence(start, indent) : parseMapping(start, indent);
  }

  function parseMapping(start, indent) {
    const result = {};
    let index = start;
    while (index < lines.length && lines[index].indent === indent && !lines[index].text.startsWith('-')) {
      const entry = lines[index];
      const pair = splitKeyValue(entry.text, entry.line);
      if (!pair) throw new YamlSubsetError('Expected key: value mapping', entry.line);
      const key = normalizeKey(pair[0], entry.line);
      const rawValue = pair[1];
      index += 1;
      if (rawValue !== '') {
        addKey(result, key, parseScalar(rawValue, entry.line), entry.line);
      } else if (index < lines.length && lines[index].indent > indent) {
        const childIndent = lines[index].indent;
        const [child, next] = parseBlock(index, childIndent);
        addKey(result, key, child, entry.line);
        index = next;
      } else {
        addKey(result, key, null, entry.line);
      }
    }
    return [result, index];
  }

  function parseSequence(start, indent) {
    const result = [];
    let index = start;
    while (index < lines.length && lines[index].indent === indent && lines[index].text.startsWith('-')) {
      const entry = lines[index];
      const afterDash = entry.text.slice(1).trim();
      index += 1;

      if (afterDash === '') {
        if (index >= lines.length || lines[index].indent <= indent) {
          result.push(null);
          continue;
        }
        const [child, next] = parseBlock(index, lines[index].indent);
        result.push(child);
        index = next;
        continue;
      }

      const firstPair = splitKeyValue(afterDash, entry.line);
      if (!firstPair) {
        result.push(parseScalar(afterDash, entry.line));
        continue;
      }

      const item = {};
      const firstKey = normalizeKey(firstPair[0], entry.line);
      if (firstPair[1] !== '') {
        addKey(item, firstKey, parseScalar(firstPair[1], entry.line), entry.line);
      } else if (index < lines.length && lines[index].indent > indent) {
        const [child, next] = parseBlock(index, lines[index].indent);
        addKey(item, firstKey, child, entry.line);
        index = next;
      } else {
        addKey(item, firstKey, null, entry.line);
      }

      while (index < lines.length && lines[index].indent > indent) {
        const continuationIndent = lines[index].indent;
        const [continuation, next] = parseBlock(index, continuationIndent);
        if (Array.isArray(continuation)) {
          throw new YamlSubsetError('Sequence item continuation must be a mapping', lines[index].line);
        }
        for (const [key, value] of Object.entries(continuation)) {
          addKey(item, key, value, lines[index].line);
        }
        index = next;
      }
      result.push(item);
    }
    return [result, index];
  }

  const [document, consumed] = parseBlock(0, lines[0].indent);
  if (consumed !== lines.length) {
    throw new YamlSubsetError('Unable to consume complete YAML document', lines[consumed].line);
  }
  return document;
}

module.exports = {
  parseYamlSubset,
  YamlSubsetError,
};


