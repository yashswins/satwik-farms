'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IoCallOutline, IoCashOutline } from 'react-icons/io5';

import CustomerFields from '@/components/order/CustomerFields';
import PromoCodeField from '@/components/order/PromoCodeField';
import ScreenHeader from '@/components/order/ScreenHeader';
import TurnstileWidget, { resetTurnstile } from '@/components/order/Turnstile';
import { formatPrice } from '@/lib/order/format';
import { S } from '@/lib/order/strings';
import { getDeviceId } from '@/lib/order/storage';
import { useCartStore, useCustomerStore, useOrderHistoryStore, useStoreHydrated } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';
import { DEFAULT_COUNTRY_CODE, fullPhoneNumber, sanitizeNotes, validateCustomer } from '@/lib/order/validation';

const PHONE_NUMBER = '+255767211422';

export default function CheckoutScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const customer = useCustomerStore();
  const hydrated = useStoreHydrated(useCustomerStore);
  const cart = useCartStore();
  const history = useOrderHistoryStore();

  const [form, setForm] = useState({
    name: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', email: '', address: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const [promo, setPromo] = useState(null);
  // True while re-checking an ambiguous submission.
  const [resolving, setResolving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const honeypotRef = useRef(null);
  const formRef = useRef(null);

  // One key per checkout attempt, reused across retries. This is what stops a
  // timeout-then-retry from creating two Sales Orders in the ERP.
  const idempotencyKey = useRef(null);
  if (idempotencyKey.current === null && typeof crypto !== 'undefined') {
    idempotencyKey.current = crypto.randomUUID?.() ?? `web-${Date.now()}-${Math.random()}`;
  }

  // Wait for the persisted store to rehydrate before copying values in. On a
  // direct page load this effect would otherwise run against empty defaults and
  // silently present blank fields to a returning customer.
  useEffect(() => {
    if (!hydrated) return;
    setForm({
      name: customer.name || '',
      countryCode: customer.countryCode || DEFAULT_COUNTRY_CODE,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.deliveryNotes || '',
    });
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const lines = useMemo(() => {
    if (!catalog) return cart.items.map((i) => ({ ...i, livePrice: i.price, ok: true }));
    return cart.items.map((item) => {
      const product = catalog.productsById.get(item.productId);
      const ok = Boolean(product && product.isActive && product.inStock);
      // Combo lines keep their combo-split price; re-pricing them from the
      // catalogue would cancel the discount the customer was shown.
      const livePrice = item.comboId ? item.price : (product?.price ?? item.price);
      return { ...item, livePrice, ok, sku: product?.accu360Sku ?? item.accu360Sku };
    });
  }, [cart.items, catalog]);

  const subtotal = lines.filter((l) => l.ok).reduce((s, l) => s + l.livePrice * l.quantity, 0);
  const deliveryFee = 0;
  // Clamp so a discount can never exceed the basket and produce a negative total.
  const discount = Math.min(promo?.amountOff ?? 0, subtotal);
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const payloadItems = lines.map((l) => ({
    product_id: l.productId,
    accu360_sku: l.sku ?? l.accu360Sku ?? '',
    name: l.name,
    quantity: l.quantity,
    unit_price: l.livePrice,
    total_price: l.livePrice * l.quantity,
    unit: l.unit ?? '',
    // Lets the backend verify a below-catalogue price is a real combo rather
    // than a forged one.
    combo_id: l.comboId ?? undefined,
  }));

  const update = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Warn before the tab closes mid-submission. The order may be in flight, and
  // leaving now is how a customer ends up not knowing whether it went through.
  useEffect(() => {
    if (!submitting) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [submitting]);

  /** Token is injected into the form by api.js as a hidden input. */
  const readTurnstileToken = () =>
    formRef.current?.querySelector('[name="cf-turnstile-response"]')?.value || null;

  const submit = async (event) => {
    event.preventDefault();
    setFailure(null);

    const found = validateCustomer(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = document.getElementById(Object.keys(found)[0]);
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.ok)) {
      setFailure('Some items are no longer available. Please review your cart.');
      return;
    }

    setSubmitting(true);
    // Save details now so they survive even if the order itself fails.
    customer.setCustomer({ ...form, deliveryNotes: sanitizeNotes(form.notes) });
    customer.markOnboarded();

    const payload = {
      customer_name: form.name.trim(),
      customer_phone: fullPhoneNumber(form),
      customer_email: form.email?.trim() || undefined,
      customer_address: form.address.trim(),
      delivery_notes: sanitizeNotes(form.notes) || undefined,
      items: payloadItems,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      // The server revalidates the code and recomputes the discount; these are
      // advisory and a mismatch is rejected there.
      promo_code: promo?.code || undefined,
      discount: discount || undefined,
      turnstileToken: readTurnstileToken(),
      idempotencyKey: idempotencyKey.current,
      website: honeypotRef.current?.value ?? '',
      deviceId: getDeviceId(),
    };

    // Resolve, never leave the customer guessing.
    //
    // A timeout or a 502/504 does NOT mean the order failed — the backend may
    // have created the Sales Order and lost the response. Telling someone
    // "we're not sure" at a checkout is the worst outcome: they either walk
    // away from a real order or place a second one.
    //
    // Because the idempotency key is reused, resending is SAFE: the backend
    // replays the original result if it succeeded, or genuinely retries if it
    // did not. So an ambiguous response is retried until it becomes a definite
    // yes or no, rather than surfaced as a maybe.
    const send = () => fetch('/api/shop/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    try {
      let res;
      let data = {};
      const MAX_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        setResolving(attempt > 1);
        try {
          res = await send();
          data = await res.json().catch(() => ({}));
          // 502/504 are our own "upstream did not answer" codes — ambiguous.
          // Anything else is a definite answer, success or failure.
          if (res.status !== 502 && res.status !== 504) break;
        } catch (networkError) {
          if (attempt === MAX_ATTEMPTS) throw networkError;
        }
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => { setTimeout(r, 2500 * attempt); });
        }
      }
      setResolving(false);

      if (res?.ok && data.success) {
        history.addOrder({
          orderId: data.order_id,
          items: payload.items,
          subtotal,
          total,
          status: data.status ?? 'pending',
        });
        cart.clearCart();
        router.replace(`/order/confirmed?id=${encodeURIComponent(data.order_id ?? '')}`);
        return;
      }

      // Business rejection (unavailable item, stale price, duplicate) or failure.
      setFailure(data.error || 'We could not place your order. Please try again.');
    } catch {
      setFailure(
        'We could not reach our ordering system, so your order was NOT placed. '
        + 'Your cart is safe — please try again, or call us and we will take it over the phone.',
      );
    } finally {
      setSubmitting(false);
      setResolving(false);
      // Any path that lands here did NOT navigate away, so the customer may
      // retry. Their Turnstile token has already been redeemed; without a reset
      // the retry fails as timeout-or-duplicate rather than for the real reason.
      resetTurnstile();
    }
  };

  if (mounted && cart.items.length === 0 && !submitting) {
    return (
      <>
        <ScreenHeader title="Checkout" fallbackHref="/order/cart" />
        <div className="p-8 text-center">
          <p className="text-[15px] text-shop-text">Your cart is empty.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Checkout" fallbackHref="/order/cart" />

      <form ref={formRef} onSubmit={submit} className="px-4 pb-6 pt-4" noValidate>
        <h2 className="mb-3 text-[15px] font-semibold text-shop-text">Delivery details</h2>
        {mounted && <CustomerFields form={form} errors={errors} onChange={update} showEmail />}

        <div className="mt-4">
          <label htmlFor="notes" className="mb-1 block text-[13px] font-medium text-shop-text">
            Delivery notes <span className="font-normal text-shop-text-secondary">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="e.g. call when you arrive at the gate"
            className="w-full resize-none rounded-shop-sm border border-shop-border bg-shop-surface
                       px-3 py-3 text-[15px] text-shop-text placeholder:text-shop-text-tertiary
                       focus:outline-none focus:ring-2 focus:ring-shop-primary/40"
          />
        </div>

        {/* Honeypot: invisible to people, irresistible to naive bots. Not
            display:none, which some bots skip. */}
        <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" ref={honeypotRef} />
        </div>

        <h2 className="mb-2 mt-7 text-[15px] font-semibold text-shop-text">Order summary</h2>
        <ul className="divide-y divide-shop-border rounded-shop-md border border-shop-border bg-shop-surface">
          {lines.map((line) => (
            <li key={line.lineId ?? line.productId} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-[14px] text-shop-text">
                {line.name}
                <span className="text-shop-text-secondary"> × {line.quantity}</span>
              </span>
              <span className="text-[14px] font-medium text-shop-text">
                {formatPrice(line.livePrice * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1.5 px-1">
          <div className="flex justify-between text-[14px] text-shop-text-secondary">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px] text-shop-text-secondary">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? S.CART_DELIVERY_FREE : formatPrice(deliveryFee)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[14px] font-medium text-shop-primary-dark">
              <span>Discount {promo?.code ? `(${promo.code})` : ''}</span>
              <span>−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-shop-border pt-2 text-[17px]
                          font-bold text-shop-text">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>

        <PromoCodeField
          items={payloadItems}
          applied={promo}
          onApply={setPromo}
          onRemove={() => setPromo(null)}
        />

        {/*
          Payment block, matching the app's checkout (CheckoutSheet.tsx:457) and
          the FAQ's wording: Cash on Delivery AND Mobile Payment, collected on
          delivery. Nothing is charged online, so saying so removes the main
          reason a customer would hesitate at this button.
        */}
        <h2 className="mb-2 mt-7 text-[15px] font-semibold text-shop-text">
          {S.CHECKOUT_PAYMENT_METHOD_LABEL}
        </h2>
        <div className="rounded-shop-md border border-shop-border bg-shop-surface p-3.5">
          <div className="flex items-start gap-3">
            <IoCashOutline aria-hidden className="mt-0.5 text-[20px] text-shop-primary-dark" />
            <div>
              <p className="text-[14px] font-medium text-shop-text">
                {S.CHECKOUT_PAYMENT_CASH}
              </p>
              <p className="text-[13px] text-shop-text-secondary">
                or {S.CHECKOUT_PAYMENT_MOBILE} ({S.CHECKOUT_PAYMENT_MOBILE_DETAIL})
              </p>
            </div>
          </div>
          <p className="mt-2.5 border-t border-shop-border pt-2.5 text-[12px] text-shop-text-secondary">
            {S.CHECKOUT_PAYMENT_NOTE}
          </p>
        </div>

        <TurnstileWidget />

        {failure && (
          <div role="alert" className="mt-5 rounded-shop-sm border border-shop-error/30
                                       bg-shop-error/5 p-3">
            <p className="text-[14px] font-semibold text-shop-error">
              Your order was not placed
            </p>
            <p className="mt-1 text-[13px] leading-[19px] text-shop-text-secondary">{failure}</p>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold
                         text-shop-primary-dark"
            >
              <IoCallOutline aria-hidden /> Call us on {PHONE_NUMBER}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-shop-primary py-3.5 text-[15px] font-semibold
                     text-white disabled:opacity-60 active:bg-shop-primary-dark"
        >
          {submitting
            ? (resolving ? 'Confirming your order…' : S.CHECKOUT_PROCESSING)
            : `${S.CHECKOUT_PLACE_ORDER} · ${formatPrice(total)}`}
        </button>
      </form>
    </>
  );
}
