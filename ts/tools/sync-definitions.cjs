const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeCsvFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) continue;
    if (entry.name.toLowerCase().endsWith('.csv')) {
      fs.rmSync(p, { force: true });
    }
  }
}

function copyCsvFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const lower = entry.name.toLowerCase();
    if (!lower.endsWith('.csv')) continue;
    if (!lower.endsWith('_definition.csv')) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    fs.copyFileSync(from, to);
  }
}

const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'game-design', 'definition');
const targetDir = path.join(repoRoot, 'ts', 'public', 'definition');

if (!fs.existsSync(sourceDir)) {
  process.exit(0);
}

ensureDir(targetDir);
removeCsvFiles(targetDir);
copyCsvFiles(sourceDir, targetDir);
