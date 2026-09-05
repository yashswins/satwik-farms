'use client';

import { useEffect, useRef, useState } from 'react';

import { dateLabel } from '@/lib/dashboard/format';
import { addDays, isIso, toDate } from '@/lib/dashboard/periods';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function monthOf(iso) {
  return iso.slice(0, 7);
}

function shiftMonth(ym, n) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Cells for one month: leading blanks (Monday-first) then ISO dates. */
function monthCells(ym) {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(`${ym}-${String(d).padStart(2, '0')}`);
  return cells;
}

export function rangeText(start, end) {
  if (!start || !end) return 'Pick dates';
  if (start === end) return dateLabel(start, { year: start.slice(0, 4) !== end.slice(0, 4) });
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${dateLabel(start, { year: !sameYear })} – ${dateLabel(end, { year: true })}`;
}

/**
 * A calendar for picking a day or a range, with no library behind it.
 *
 * Click a start day, then an end day; click the same day twice for a single
 * day. Two months side by side on wide screens, one on phones. Future days
 * are disabled (Dar "today" comes from the server so the browser's clock
 * cannot disagree with the data). Typed dates are accepted in the two fields
 * at the bottom, which are native date inputs and so open the phone's own
 * picker on mobile.
 */
export default function DateRangePicker({ start, end, today, onApply, label = 'Dates', compact = false }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);       // first click of a range in progress
  const [hover, setHover] = useState(null);
  const [cursor, setCursor] = useState(monthOf(end || today));
  const [typed, setTyped] = useState({ from: start || today, to: end || today });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => { setTyped({ from: start || today, to: end || today }); setCursor(monthOf(end || today)); }, [start, end, today]);

  function apply(from, to) {
    const a = from <= to ? from : to;
    const b = from <= to ? to : from;
    setOpen(false);
    setAnchor(null);
    onApply(a, b > today ? today : b);
  }

  function pick(iso) {
    if (iso > today) return;
    if (!anchor) { setAnchor(iso); setHover(iso); return; }
    apply(anchor, iso);
  }

  const selStart = anchor ? (hover && hover < anchor ? hover : anchor) : start;
  const selEnd = anchor ? (hover && hover > anchor ? hover : anchor) : end;
  const months = [cursor, shiftMonth(cursor, 1)];
  const canForward = shiftMonth(cursor, 1) <= monthOf(today);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={label}
        className={`inline-flex items-center gap-2 rounded-shop-sm border border-shop-border bg-shop-surface px-2.5 py-1.5 text-sm
                    hover:bg-shop-surface-alt dark:border-[#2E352E] dark:bg-[#1A1E1A] dark:hover:bg-[#252A25] ${compact ? 'text-xs' : ''}`}
      >
        <span aria-hidden>📅</span>
        <span>{rangeText(start, end)}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose dates"
          className="absolute right-0 z-30 mt-1 w-[min(94vw,40rem)] rounded-shop-md border border-shop-border bg-shop-surface p-3 shadow-xl
                     dark:border-[#2E352E] dark:bg-[#1A1E1A]"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex gap-1">
              {[['Today', today, today], ['Yesterday', addDays(today, -1), addDays(today, -1)], ['Last 7 days', addDays(today, -6), today], ['This month', `${today.slice(0, 7)}-01`, today]].map(([t, a, b]) => (
                <button key={t} type="button" onClick={() => apply(a, b)} className="rounded-full border border-shop-border px-2 py-0.5 hover:bg-shop-surface-alt dark:border-[#2E352E] dark:hover:bg-[#252A25]">{t}</button>
              ))}
            </div>
            <span className="text-shop-text-secondary">{anchor ? `From ${dateLabel(anchor)} — now pick the end day` : 'Click a start day, then an end day'}</span>
          </div>

          <div className="flex items-start gap-3">
            <button type="button" onClick={() => setCursor(shiftMonth(cursor, -1))} aria-label="Previous month" className="mt-1 rounded px-2 py-1 hover:bg-shop-surface-alt dark:hover:bg-[#252A25]">‹</button>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              {months.map((ym, idx) => (
                <div key={ym} className={idx === 1 ? 'hidden sm:block' : ''}>
                  <p className="mb-1 text-center text-sm font-semibold">{MONTHS[Number(ym.slice(5, 7)) - 1]} {ym.slice(0, 4)}</p>
                  <div className="grid grid-cols-7 gap-y-0.5 text-center text-xs">
                    {DOW.map((d) => <span key={d} className="py-1 text-shop-text-secondary">{d}</span>)}
                    {monthCells(ym).map((iso, i) => {
                      if (!iso) return <span key={`b${i}`} />;
                      const disabled = iso > today;
                      const inRange = selStart && selEnd && iso >= selStart && iso <= selEnd;
                      const isEdge = iso === selStart || iso === selEnd;
                      return (
                        <button
                          key={iso}
                          type="button"
                          disabled={disabled}
                          onClick={() => pick(iso)}
                          onMouseEnter={() => anchor && setHover(iso)}
                          aria-label={dateLabel(iso, { year: true })}
                          aria-pressed={isEdge}
                          className={`h-8 rounded-md tabular-nums transition ${
                            disabled ? 'text-shop-text-tertiary'
                              : isEdge ? 'bg-shop-primary font-semibold text-white'
                                : inRange ? 'bg-shop-primary/20 text-shop-primary-dark dark:text-shop-primary-light'
                                  : iso === today ? 'font-semibold text-shop-primary-dark hover:bg-shop-surface-alt dark:text-shop-primary-light dark:hover:bg-[#252A25]'
                                    : 'hover:bg-shop-surface-alt dark:hover:bg-[#252A25]'
                          }`}
                        >
                          {Number(iso.slice(8, 10))}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => canForward && setCursor(shiftMonth(cursor, 1))} disabled={!canForward} aria-label="Next month" className="mt-1 rounded px-2 py-1 hover:bg-shop-surface-alt disabled:opacity-30 dark:hover:bg-[#252A25]">›</button>
          </div>

          <form
            className="mt-3 flex flex-wrap items-end gap-2 border-t border-shop-border pt-3 text-xs dark:border-[#2E352E]"
            onSubmit={(e) => { e.preventDefault(); if (isIso(typed.from) && isIso(typed.to)) apply(typed.from, typed.to); }}
          >
            <label className="flex flex-col text-shop-text-secondary">From
              <input type="date" value={typed.from} max={today} onChange={(e) => setTyped({ ...typed, from: e.target.value })} className="mt-0.5 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" />
            </label>
            <label className="flex flex-col text-shop-text-secondary">To
              <input type="date" value={typed.to} max={today} onChange={(e) => setTyped({ ...typed, to: e.target.value })} className="mt-0.5 rounded border border-shop-border bg-transparent px-2 py-1 text-sm dark:border-[#2E352E]" />
            </label>
            <button type="submit" className="rounded-shop-sm bg-shop-primary px-3 py-1.5 text-sm font-medium text-white">Apply</button>
            <button type="button" onClick={() => { setOpen(false); setAnchor(null); }} className="px-2 py-1.5 text-shop-text-secondary hover:underline">Cancel</button>
            <span className="ml-auto text-shop-text-secondary">{toDate(typed.to) >= toDate(typed.from) && isIso(typed.from) && isIso(typed.to) ? `${Math.round((toDate(typed.to) - toDate(typed.from)) / 86_400_000) + 1} day${typed.from === typed.to ? '' : 's'}` : ''}</span>
          </form>
        </div>
      )}
    </div>
  );
}
