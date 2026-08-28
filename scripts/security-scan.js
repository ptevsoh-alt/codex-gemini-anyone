'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', '.git', '.local', 'workspace', 'downloads', 'output', 'tmp', 'cache']);
const patterns = [
  /[A-Za-z0-9._%+-]+@(?:gmail|googlemail)\.com/i,
  /(?:^|[\s"'=])(sk-[A-Za-z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,})/i,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/i,
  /(?:password|access[_-]?token|refresh[_-]?token|api[_-]?key)\s*[:=]\s*["']?[^"'#\s]+/i,
  /(?:cookies?|sessions?|login[_-]?data|local[_-]?state)\s*[:=]\s*["']?[^"'#\s]+/i
];

function walk(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

const hits = [];
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) if (pattern.test(text)) hits.push(path.relative(root, file));
}
if (hits.length) { console.error(JSON.stringify({ status:'FAIL', hits }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ status:'PASS', scanned:walk(root).length }, null, 2));

