'use client';

import { IoCallOutline, IoLogoWhatsapp, IoMailOutline } from 'react-icons/io5';

import ScreenHeader from '@/components/order/ScreenHeader';
import { S } from '@/lib/order/strings';

export default function HelpScreen() {
  return (
    <>
      <ScreenHeader title={S.HELP_TITLE} fallbackHref="/order/account" />

      <div className="px-4 pb-8 pt-4">
        <section>
          <h2 className="text-[16px] font-semibold text-shop-text">
            {S.HELP_HOW_TO_ORDER_TITLE}
          </h2>
          <ol className="mt-3 space-y-3">
            {S.HELP_HOW_TO_ORDER_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                                 bg-shop-primary text-[12px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-[21px] text-shop-text-secondary">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-[16px] font-semibold text-shop-text">Delivery</h2>
          <p className="mt-2 text-[14px] leading-[21px] text-shop-text-secondary">
            {S.FAQ_DELIVERY}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[16px] font-semibold text-shop-text">Payment</h2>
          <p className="mt-2 text-[14px] leading-[21px] text-shop-text-secondary">
            We accept {S.CHECKOUT_PAYMENT_CASH} and {S.CHECKOUT_PAYMENT_MOBILE}{' '}
            ({S.CHECKOUT_PAYMENT_MOBILE_DETAIL}). {S.CHECKOUT_PAYMENT_NOTE}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[16px] font-semibold text-shop-text">{S.HELP_CONTACT_TITLE}</h2>
          <ul className="mt-3 overflow-hidden rounded-shop-md border border-shop-border
                         bg-shop-surface">
            <li className="border-b border-shop-border">
              <a
                href={`tel:${S.HELP_CONTACT_PHONE_HREF}`}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-shop-surface-alt
                           md:hover:bg-shop-surface-alt"
              >
                <IoCallOutline aria-hidden className="text-[20px] text-shop-primary-dark" />
                <span className="text-[15px] text-shop-text">{S.HELP_CONTACT_PHONE}</span>
              </a>
            </li>
            <li className="border-b border-shop-border">
              <a
                href={S.HELP_CONTACT_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 active:bg-shop-surface-alt
                           md:hover:bg-shop-surface-alt"
              >
                <IoLogoWhatsapp aria-hidden className="text-[20px] text-shop-primary-dark" />
                <span className="text-[15px] text-shop-text">{S.HELP_CONTACT_WHATSAPP}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${S.HELP_CONTACT_EMAIL}`}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-shop-surface-alt
                           md:hover:bg-shop-surface-alt"
              >
                <IoMailOutline aria-hidden className="text-[20px] text-shop-primary-dark" />
                <span className="text-[15px] text-shop-text">{S.HELP_CONTACT_EMAIL}</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
