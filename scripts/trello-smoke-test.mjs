import { readFileSync, existsSync } from 'node:fs';

const required = [
  'docs/trello-live.html',
  'docs/trello-main.js',
  'docs/trello-extra.js',
  'docs/trello-power.js',
  'docs/trello-phase2.js',
  'docs/trello-phase5.js',
  'docs/trello-phase6.js',
  'docs/trello-phase6.css',
  'supabase/trello-auth-schema.sql',
  'docs/trello-auth-setup.md'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing Trello smoke-test files:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

const extra = readFileSync('docs/trello-extra.js', 'utf8');
for (const token of ['trello-phase2.js', 'trello-phase5.js', 'trello-phase6.js']) {
  if (!extra.includes(token)) {
    console.error(`docs/trello-extra.js does not load ${token}`);
    process.exit(1);
  }
}

const phase6 = readFileSync('docs/trello-phase6.js', 'utf8');
for (const token of ['signInWithPassword', 'signUp', 'signInWithOAuth', 'trello_user_profiles']) {
  if (!phase6.includes(token)) {
    console.error(`docs/trello-phase6.js missing ${token}`);
    process.exit(1);
  }
}

console.log('Trello smoke test passed.');
