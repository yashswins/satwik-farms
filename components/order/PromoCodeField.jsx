'use client';

import { useState } from 'react';
import { IoPricetagOutline, IoClose } from 'react-icons/io5';

import { formatPrice } from '@/lib/order/format';

/**
 * Promo code entry.
 *
 * The discount is decided by the server (see app/api/shop/promo) — the browser
 * never holds the code list, and whatever it displays is recomputed again when
 * the order is placed. So this is presentation only; it cannot grant a discount.
 */
export default function PromoCodeField({ items, applied, onApply, onRemove }) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(null);

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setMessage({ ok: false, text: 'Please enter a promo code' });
      return;
    }
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch('/api/shop/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, items }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        onApply({ code: data.code, amountOff: data.amountOff });
        setMessage({ ok: true, text: data.message });
        setCode('');
      } else {
        setMessage({ ok: false, text: data.message || 'Could not apply promo code.' });
      }
    } catch {
      setMessage({ ok: false, text: 'Could not apply promo code. Please try again.' });
    } finally {
      setChecking(false);
    }
  };

  if (applied) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-shop-sm border border-shop-primary/40
                      bg-shop-primary/5 p-3">
        <IoPricetagOutline aria-hidden className="text-[18px] text-shop-primary-dark" />
        <span className="flex-1 text-[14px] text-shop-text">
          <span className="font-semibold">{applied.code}</span> applied
          {applied.amountOff > 0 && (
            <span className="text-shop-text-secondary"> · −{formatPrice(applied.amountOff)}</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => { onRemove(); setMessage(null); }}
          aria-label="Remove promo code"
          className="text-shop-text-secondary"
        >
          <IoClose aria-hidden className="text-[18px]" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.slice(0, 32))}
          onKeyDown={(e) => {
            // Inside a form, Enter would submit the order instead.
            if (e.key === 'Enter') { e.preventDefault(); apply(); }
          }}
          placeholder="Enter promo code"
          aria-label="Promo code"
          autoCapitalize="characters"
          className="flex-1 rounded-shop-sm border border-shop-border bg-shop-surface px-3 py-2.5
                     text-[14px] uppercase text-shop-text placeholder:normal-case
                     placeholder:text-shop-text-tertiary focus:outline-none focus:ring-2
                     focus:ring-shop-primary/40"
        />
        <button
          type="button"
          onClick={apply}
          disabled={checking}
          className="rounded-shop-sm border border-shop-primary px-4 py-2.5 text-[14px]
                     font-semibold text-shop-primary disabled:opacity-60"
        >
          {checking ? '…' : 'Apply'}
        </button>
      </div>
      {message && (
        <p
          role="status"
          className={`mt-1.5 text-[12px] ${message.ok ? 'text-shop-primary-dark' : 'text-shop-error'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
