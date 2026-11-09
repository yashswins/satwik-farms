// @vitest-environment node
/**
 * The dashboard's trust boundary, checked from source.
 *
 * middleware.js and app/dashboard/(app)/layout.jsx both gate /dashboard, but
 * neither is a security boundary on its own: Next.js shipped several
 * middleware bypasses in 2026 alone (GHSA-492v-c6pp-mqqv, GHSA-267c-6grr-h53f,
 * GHSA-26hh-7cqf-hhc6), and the App Router can render a page segment without
 * re-running its layout. So, as lib/dashboard/session.js says:
 *   - every dashboard page's default export STARTS with requireDashboardUser()
 *   - every Server Action re-checks inside its own body
 *   - every /api/dashboard route handler calls requireApiUser()
 * A new page or action that forgets fails here instead of shipping.
 */
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// Same root the '@' alias in vitest.config.js uses.
const ROOT = path.resolve(process.cwd());
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(p, 'utf8');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const SOURCE = /\.(jsx?|tsx?|mjs)$/;
const DASHBOARD = path.join(ROOT, 'app', 'dashboard');
const LOGIN = path.join(DASHBOARD, 'login') + path.sep;

/** Drop leading whitespace and comments. */
const stripLeading = (s) => s.replace(/^(?:\s+|\/\/[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*/, '');

/** Everything after the opening brace of the file's default-export function, or null. */
function defaultExportBody(src) {
  const m = /export\s+default\s+(?:async\s+)?function\s*\w*\s*\([^)]*\)\s*\{/.exec(src);
  return m ? src.slice(m.index + m[0].length) : null;
}

const STARTS_WITH_CHECK = /^(?:const\s+(?:\w+|\{[^}]*\})\s*=\s*)?await\s+requireDashboardUser\s*\(/;
const IMPORTS_CHECK = /import\s*\{[^}]*\brequireDashboardUser\b[^}]*\}\s*from\s*['"]@\/lib\/dashboard\/session['"]/;

/** The body of every function whose first statement is the 'use server' directive. */
function serverActions(src, file) {
  const found = [];
  const directive = /(['"])use server\1/g;
  let m;
  while ((m = directive.exec(src))) {
    const before = src.slice(0, m.index);
    if (stripLeading(before) === '') {
      found.push({ file, name: '(file-level)', body: src, fileLevel: true });
      continue;
    }
    const open = before.lastIndexOf('{');
    if (open < 0 || src.slice(open + 1, m.index).trim() !== '') continue; // a string, not a directive
    let depth = 0;
    let end = src.length;
    for (let i = open; i < src.length; i += 1) {
      if (src[i] === '{') depth += 1;
      else if (src[i] === '}' && --depth === 0) { end = i; break; }
    }
    const header = src.slice(Math.max(0, open - 160), open).trimEnd();
    const name = (/function\s+(\w+)\s*\([^)]*\)$/.exec(header) || /(\w+)\s*=\s*async\s*\([^)]*\)\s*=>$/.exec(header) || [null, '(inline)'])[1];
    found.push({ file, name, body: src.slice(open + 1, end), fileLevel: false });
  }
  return found;
}

const pages = walk(DASHBOARD).filter((p) => /[\\/]page\.(jsx?|tsx?)$/.test(p) && !p.startsWith(LOGIN));
const actionFiles = [DASHBOARD, path.join(ROOT, 'components', 'dashboard'), path.join(ROOT, 'lib', 'dashboard')]
  .flatMap(walk)
  .filter((p) => SOURCE.test(p) && !/\.test\./.test(p));
const actions = actionFiles.flatMap((p) => serverActions(read(p), rel(p)));
const routes = walk(path.join(ROOT, 'app', 'api', 'dashboard')).filter((p) => /[\\/]route\.(js|ts)$/.test(p));

describe('dashboard pages check the user themselves', () => {
  it('finds the dashboard pages (guards against a silent empty scan)', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map(rel))('%s starts its default export with requireDashboardUser()', (file) => {
    const src = read(path.join(ROOT, file));
    const body = defaultExportBody(src);
    expect(body, 'default export must be a function declaration').not.toBeNull();
    expect(stripLeading(body)).toMatch(STARTS_WITH_CHECK);
    expect(src).toMatch(IMPORTS_CHECK);
  });

  it('the (app) layout still checks too (defence in depth)', () => {
    const body = defaultExportBody(read(path.join(DASHBOARD, '(app)', 'layout.jsx')));
    expect(stripLeading(body || '')).toMatch(STARTS_WITH_CHECK);
  });
});

describe('dashboard Server Actions re-check the user inside their own body', () => {
  it('finds the Server Actions (guards against a silent empty scan)', () => {
    expect(actions.length).toBeGreaterThan(0);
  });

  it.each(actions.map((a) => [`${a.file} → ${a.name}`, a]))('%s', (_label, action) => {
    if (action.fileLevel) {
      const exported = (action.body.match(/export\s+async\s+function\s+\w+/g) || []).length;
      const checks = (action.body.match(/requireDashboardUser\s*\(/g) || []).length;
      expect(checks).toBeGreaterThanOrEqual(exported);
      return;
    }
    // Sign-in and sign-out are the only actions allowed to run without a dashboard user.
    expect(action.body).toMatch(/requireDashboardUser\s*\(|\bsignIn\s*\(|\bsignOut\s*\(/);
  });
});

describe('dashboard API route handlers check the user', () => {
  it.each(routes.length ? routes.map(rel) : ['(none yet)'])('%s calls requireApiUser()', (file) => {
    if (file === '(none yet)') return;
    expect(read(path.join(ROOT, file))).toMatch(/requireApiUser\s*\(/);
  });
});
