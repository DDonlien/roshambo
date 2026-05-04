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
const sourceDir = path.join(repoRoot, 'game-design', 'definition');
const targetDir = path.join(repoRoot, 'ts', 'public', 'definition');

if (!fs.existsSync(sourceDir)) {
  process.exit(0);
}

ensureEmptyDir(targetDir);
copyDir(sourceDir, targetDir);
