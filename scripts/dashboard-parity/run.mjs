/**
 * Dashboard parity: do the dashboard's queries return the same thing at two
 * versions of the code, against one database?
 *
 *   DASHBOARD_DATABASE_URL=... node scripts/dashboard-parity/run.mjs [base-ref]
 *
 * base-ref (default HEAD) is checked out of git into .base/ (ignored); the
 * working tree is the other side. Every exported query function is called on
 * both with the same arguments and the results are compared exactly (floats
 * to 1e-9 relative). Read-only: it only SELECTs, but point it at a Neon
 * branch when you can, so the data cannot move between the two calls.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const root = path.resolve(here, '..', '..');
const base = process.argv[2] || 'HEAD';
const out = path.join(here, '.base', 'queries');
fs.rmSync(path.join(here, '.base'), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const files = execFileSync('git', ['ls-tree', '--name-only', `${base}:lib/dashboard/queries`], { cwd: root, encoding: 'utf8' })
  .split('\n').filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'));
for (const f of files) {
  const src = execFileSync('git', ['show', `${base}:lib/dashboard/queries/${f}`], { cwd: root, encoding: 'utf8' });
  fs.writeFileSync(path.join(out, f), src.replaceAll("'@/lib/dashboard/queries/_names'", "'./_names.js'"));
}
if (!process.env.DASHBOARD_DATABASE_URL) {
  console.error('DASHBOARD_DATABASE_URL is not set');
  process.exit(2);
}
console.log(`parity: ${base} (${files.length} query files) vs working tree, on ${new URL(process.env.DASHBOARD_DATABASE_URL.replace(/^postgres(ql)?:/, 'http:')).hostname}`);
const r = spawnSync(process.execPath, [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', path.join(here, 'vitest.config.mjs')],
  { cwd: root, stdio: 'inherit', env: { ...process.env, PARITY_BASE_REF: base } });
const reportFile = path.join(here, '.base', 'report.txt');
if (fs.existsSync(reportFile)) process.stdout.write(`
${fs.readFileSync(reportFile, 'utf8')}`);
process.exit(r.status ?? 1);
