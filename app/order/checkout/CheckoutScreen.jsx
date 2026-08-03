'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoCallOutline } from 'react-icons/io5';

import CustomerFields from '@/components/order/CustomerFields';
import ScreenHeader from '@/components/order/ScreenHeader';
import TurnstileWidget from '@/components/order/Turnstile';
import { formatPrice } from '@/lib/order/format';
import { getDeviceId } from '@/lib/order/storage';
import { useCartStore, useCustomerStore, useOrderHistoryStore } from '@/lib/order/stores';
import { useCatalog } from '@/lib/order/useCatalog';
import { DEFAULT_COUNTRY_CODE, fullPhoneNumber, sanitizeNotes, validateCustomer } from '@/lib/order/validation';

const PHONE_NUMBER = '+255767211422';

export default function CheckoutScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const customer = useCustomerStore();
  const cart = useCartStore();
  const history = useOrderHistoryStore();

  const [form, setForm] = useState({
    name: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', email: '', address: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [mounted, setMounted] = useState(false);
  const honeypotRef = useRef(null);

  // One key per checkout attempt, reused across retries. This is what stops a
  // timeout-then-retry from creating two Sales Orders in the ERP.
  const idempotencyKey = useRef(null);
  if (idempotencyKey.current === null && typeof crypto !== 'undefined') {
    idempotencyKey.current = crypto.randomUUID?.() ?? `web-${Date.now()}-${Math.random()}`;
  }

  useEffect(() => {
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
  }, []);

  const lines = useMemo(() => {
    if (!catalog) return cart.items.map((i) => ({ ...i, livePrice: i.price, ok: true }));
    return cart.items.map((item) => {
      const product = catalog.productsById.get(item.productId);
      const ok = Boolean(product && product.isActive && product.inStock);
      return { ...item, livePrice: product?.price ?? item.price, ok, sku: product?.accu360Sku ?? item.accu360Sku };
    });
  }, [cart.items, catalog]);

  const subtotal = lines.filter((l) => l.ok).reduce((s, l) => s + l.livePrice * l.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const update = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleToken = useCallback((token) => setTurnstileToken(token), []);

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
      items: lines.map((l) => ({
        product_id: l.productId,
        accu360_sku: l.sku ?? l.accu360Sku ?? '',
        name: l.name,
        quantity: l.quantity,
        unit_price: l.livePrice,
        total_price: l.livePrice * l.quantity,
        unit: l.unit ?? '',
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total,
      turnstileToken,
      idempotencyKey: idempotencyKey.current,
      website: honeypotRef.current?.value ?? '',
      deviceId: getDeviceId(),
    };

    try {
      const res = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
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
      setFailure('We could not reach our ordering system. Your cart is safe — please try again.');
    } finally {
      setSubmitting(false);
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

      <form onSubmit={submit} className="px-4 pb-6 pt-4" noValidate>
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
            <li key={line.productId} className="flex items-center justify-between gap-3 px-3 py-2.5">
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
            <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-shop-border pt-2 text-[17px]
                          font-bold text-shop-text">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>

        <TurnstileWidget onToken={handleToken} />

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
          {submitting ? 'Placing your order…' : `Place order · ${formatPrice(total)}`}
        </button>

        <p className="mt-3 text-center text-[12px] text-shop-text-secondary">
          You&apos;ll pay on delivery. We&apos;ll call to confirm.
        </p>
      </form>
    </>
  );
}
