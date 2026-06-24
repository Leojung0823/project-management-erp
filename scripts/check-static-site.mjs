import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const docsDir = join(process.cwd(), 'docs');
const htmlFiles = readdirSync(docsDir).filter((name) => name.endsWith('.html'));
const localAssetPattern = /<(?:script|link)\b[^>]+(?:src|href)=["']([^"']+)["']/g;
const problems = [];

for (const file of htmlFiles) {
  const filePath = join(docsDir, file);
  const html = readFileSync(filePath, 'utf8');
  for (const match of html.matchAll(localAssetPattern)) {
    const raw = match[1];
    if (/^(https?:)?\/\//.test(raw) || raw.startsWith('data:') || raw.startsWith('#')) continue;
    const clean = raw.split('?')[0].split('#')[0];
    if (!clean || clean === '/') continue;
    const target = clean.startsWith('/')
      ? join(process.cwd(), clean.replace(/^\//, ''))
      : join(dirname(filePath), clean);
    if (!existsSync(target)) problems.push(`${file}: missing ${raw}`);
  }
}

if (problems.length) {
  console.error('Static asset check failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Static asset check passed for ${htmlFiles.length} HTML files.`);
