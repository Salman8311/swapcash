const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../../frontend');
const dest = path.resolve(__dirname, '../dist');

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyDir(source, dest);
console.log('Copied frontend to', dest);

