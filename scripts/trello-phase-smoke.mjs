import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docs = path.join(root, 'docs');
const live = fs.readFileSync(path.join(docs, 'trello-live.html'), 'utf8');

const required = [
  'trello-main.js',
  'trello-extra.js',
  'trello-power.js',
  'trello-phase8.js',
  'trello-phase12.js',
  'trello-phase13.js',
  'trello-phase14.js',
  'trello-phase15-hotfix.js',
  'trello-phase16.js',
  'trello-phase12.css',
  'trello-phase13.css',
  'trello-phase14.css',
  'trello-phase15-hotfix.css',
  'trello-phase16.css'
];

const missingRefs = required.filter(file => !live.includes(file));
const missingFiles = required.filter(file => !fs.existsSync(path.join(docs, file)));

if (missingRefs.length || missingFiles.length) {
  console.error('Trello phase smoke failed');
  if (missingRefs.length) console.error('Missing HTML references:', missingRefs.join(', '));
  if (missingFiles.length) console.error('Missing files:', missingFiles.join(', '));
  process.exit(1);
}

const phase14 = fs.readFileSync(path.join(docs, 'trello-phase14.js'), 'utf8');
const phase14Checks = ['openMentions', 'openAssign', 'openDeepImport', 'openGantt', 'convertDeep'];
const missingPhase14 = phase14Checks.filter(token => !phase14.includes(token));
if (missingPhase14.length) {
  console.error('Phase 14 feature hooks missing:', missingPhase14.join(', '));
  process.exit(1);
}

const hotfix = fs.readFileSync(path.join(docs, 'trello-phase15-hotfix.js'), 'utf8');
const hotfixChecks = ['patchModalActions', 'patchAdvancedPanels', 't15-floating-save'];
const missingHotfix = hotfixChecks.filter(token => !hotfix.includes(token));
if (missingHotfix.length) {
  console.error('Phase 15 hotfix hooks missing:', missingHotfix.join(', '));
  process.exit(1);
}

console.log('Trello phase smoke passed: live HTML loads phase 12/13/14/15/16 and key hooks exist.');
