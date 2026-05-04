const fs = require('fs');
const path = require('path');

function ensureEmptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
      continue;
    }
    fs.copyFileSync(from, to);
  }
}

const repoRoot = path.resolve(__dirname, '..', '..');

const sources = [
  {
    src: path.join(repoRoot, 'game-design', 'art', 'sketch'),
    dest: path.join(repoRoot, 'ts', 'public', 'game-design', 'art', 'sketch')
  },
  {
    src: path.join(repoRoot, 'game-design', 'art', 'ui', 'asset'),
    dest: path.join(repoRoot, 'ts', 'public', 'game-design', 'art', 'ui', 'asset')
  }
];

for (const { src, dest } of sources) {
  if (!fs.existsSync(src)) continue;
  ensureEmptyDir(dest);
  copyDir(src, dest);
}
