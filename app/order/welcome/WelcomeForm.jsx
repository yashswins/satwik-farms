'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoLockClosedOutline } from 'react-icons/io5';

import CustomerFields from '@/components/order/CustomerFields';
import { useCustomerStore } from '@/lib/order/stores';
import { validateCustomer, DEFAULT_COUNTRY_CODE } from '@/lib/order/validation';

/**
 * First-run details capture, mirroring the phone app's onboarding: one screen,
 * with a Skip that lets people browse as a guest and give details at checkout.
 */
export default function WelcomeForm() {
  const router = useRouter();
  const customer = useCustomerStore();
  const [form, setForm] = useState({
    name: '', countryCode: DEFAULT_COUNTRY_CODE, phone: '', email: '', address: '',
  });
  const [errors, setErrors] = useState({});
  const [hydrated, setHydrated] = useState(false);

  // Prefill from storage once mounted — this is the whole point of the screen:
  // a returning customer should never retype what they already gave us.
  useEffect(() => {
    setForm({
      name: customer.name || '',
      countryCode: customer.countryCode || DEFAULT_COUNTRY_CODE,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    });
    setHydrated(true);
    // Run once on mount; the store is the source of truth thereafter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateCustomer(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = document.getElementById(Object.keys(found)[0]);
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    customer.setCustomer(form);
    customer.markOnboarded();
    router.push('/order');
  };

  const handleSkip = () => {
    // Browse as a guest; details are collected at checkout instead.
    customer.markOnboarded();
    router.push('/order');
  };

  return (
    <div className="min-h-screen bg-shop-bg">
      <header className="bg-gradient-to-b from-shop-primary-light to-shop-bg px-5 pb-6 pt-9 text-center">
        <Image
          src="/images/logo.png"
          alt="Satwik Farms"
          width={64}
          height={64}
          className="mx-auto rounded-full bg-white/80 p-1"
        />
        <h1 className="mt-3 text-[22px] font-semibold text-shop-text">Welcome to Satwik Farms</h1>
        <p className="mt-1 text-[14px] text-shop-text-secondary">
          Fresh from farm to your doorstep
        </p>
      </header>

      <form onSubmit={handleSubmit} className="px-5 pb-10 pt-6" noValidate>
        <p className="mb-5 text-[14px] text-shop-text-secondary">
          Tell us where to deliver. We&apos;ll remember it for next time.
        </p>

        {hydrated && (
          <CustomerFields form={form} errors={errors} onChange={update} showEmail />
        )}

        <div className="mt-5 flex items-start gap-2 rounded-shop-sm bg-shop-surface-alt p-3">
          <IoLockClosedOutline aria-hidden className="mt-0.5 shrink-0 text-shop-primary-dark" />
          <p className="text-[12px] leading-[17px] text-shop-text-secondary">
            Your details are saved only on this device to speed up your next order. You can
            clear them any time from the Account tab.
          </p>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-shop-primary py-3.5 text-[15px]
                     font-semibold text-white active:bg-shop-primary-dark"
        >
          Start shopping
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="mt-3 w-full py-2 text-[14px] font-medium text-shop-text-secondary"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
