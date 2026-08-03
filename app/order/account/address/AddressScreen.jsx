'use client';

import { useEffect, useState } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';

import CustomerFields from '@/components/order/CustomerFields';
import ScreenHeader from '@/components/order/ScreenHeader';
import { S } from '@/lib/order/strings';
import { useCustomerStore, useStoreHydrated } from '@/lib/order/stores';
import { DEFAULT_COUNTRY_CODE, sanitizeNotes, validateCustomer } from '@/lib/order/validation';

/**
 * Edit saved delivery details.
 *
 * Uses the same CustomerFields and the same validateCustomer as onboarding and
 * checkout. The phone app has three separate implementations of this form, and
 * the address one skips sanitisation entirely — one shared component is how that
 * class of bug is avoided rather than re-introduced.
 */
export default function AddressScreen() {
  const customer = useCustomerStore();
  const hydrated = useStoreHydrated(useCustomerStore);
  const [form, setForm] = useState({
    name: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', email: '', address: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const update = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validateCustomer(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = document.getElementById(Object.keys(found)[0]);
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    customer.setCustomer({ ...form, deliveryNotes: sanitizeNotes(form.notes) });
    customer.markOnboarded();
    setSaved(true);
  };

  return (
    <>
      <ScreenHeader title={S.ADDRESS_TITLE} fallbackHref="/order/account" />

      <form onSubmit={submit} className="px-4 pb-8 pt-4" noValidate>
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
            placeholder={S.CHECKOUT_NOTES_PLACEHOLDER}
            className="w-full resize-none rounded-shop-sm border border-shop-border bg-shop-surface
                       px-3 py-3 text-[15px] text-shop-text placeholder:text-shop-text-tertiary
                       focus:outline-none focus:ring-2 focus:ring-shop-primary/40"
          />
        </div>

        {saved && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 rounded-shop-sm bg-shop-primary/10 p-3
                       text-[14px] font-medium text-shop-primary-dark"
          >
            <IoCheckmarkCircle aria-hidden className="text-[18px]" />
            {S.ADDRESS_SAVED}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-shop-primary py-3.5 text-[15px] font-semibold
                     text-white active:bg-shop-primary-dark"
        >
          Save details
        </button>
      </form>
    </>
  );
}
