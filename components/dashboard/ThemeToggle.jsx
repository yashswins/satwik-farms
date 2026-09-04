'use client';

import { useEffect, useState } from 'react';

export const THEME_KEY = 'sf-dashboard-theme';
const ORDER = ['system', 'light', 'dark'];
const LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' };
const ICON = { system: '◐', light: '☀', dark: '☾' };

function apply(theme) {
  const scope = document.getElementById('dashboard-theme-scope');
  if (!scope) return;
  scope.classList.remove('light', 'dark');
  if (theme === 'light' || theme === 'dark') scope.classList.add(theme);
}

/**
 * Auto → Light → Dark. Stored per browser in localStorage; the inline script
 * in app/dashboard/layout.jsx applies it before first paint so there is no
 * flash, and this component keeps the button in step.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState('system');
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (ORDER.includes(stored)) setTheme(stored);
    } catch { /* storage blocked: stay on system */ }
  }, []);

  function next() {
    const value = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(value);
    apply(value);
    try { localStorage.setItem(THEME_KEY, value); } catch { /* ignore */ }
  }

  return (
    <button
      type="button"
      onClick={next}
      title={`Theme: ${LABEL[theme]} (click to change)`}
      aria-label={`Theme: ${LABEL[theme]}`}
      className="rounded-shop-sm border border-shop-border px-2 py-1.5 text-xs font-medium text-shop-text-secondary
                 hover:bg-shop-surface-alt dark:border-[#2E352E] dark:hover:bg-[#252A25]"
    >
      <span aria-hidden>{ICON[theme]}</span> {LABEL[theme]}
    </button>
  );
}
