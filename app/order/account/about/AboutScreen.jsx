'use client';

import Image from 'next/image';
import Link from 'next/link';

import ScreenHeader from '@/components/order/ScreenHeader';
import { S } from '@/lib/order/strings';

export default function AboutScreen() {
  return (
    <>
      <ScreenHeader title={S.ABOUT_TITLE} fallbackHref="/order/account" />

      <div className="px-4 pb-8 pt-6">
        <div className="text-center">
          <Image
            src="/images/logo.png"
            alt="Satwik Farms"
            width={72}
            height={72}
            className="mx-auto rounded-full bg-white p-1"
          />
          <h2 className="mt-3 text-[18px] font-semibold text-shop-text">{S.APP_NAME}</h2>
          <p className="mx-auto mt-1 max-w-[320px] text-[14px] leading-[21px] text-shop-text-secondary">
            {S.ABOUT_TAGLINE}
          </p>
        </div>

        <section className="mt-8">
          <h3 className="text-[15px] font-semibold text-shop-text">{S.ABOUT_HOURS_TITLE}</h3>
          <p className="mt-2 text-[14px] text-shop-text-secondary">{S.ABOUT_HOURS_WEEKDAY}</p>
          <p className="text-[14px] text-shop-text-secondary">{S.ABOUT_HOURS_WEEKEND}</p>
        </section>

        <section className="mt-8">
          <h3 className="text-[15px] font-semibold text-shop-text">{S.HELP_CONTACT_TITLE}</h3>
          <p className="mt-2 text-[14px] text-shop-text-secondary">{S.LOCATION}</p>
          <a
            href={`tel:${S.HELP_CONTACT_PHONE_HREF}`}
            className="mt-1 block text-[14px] font-medium text-shop-primary-dark"
          >
            {S.HELP_CONTACT_PHONE}
          </a>
          <a
            href={`mailto:${S.HELP_CONTACT_EMAIL}`}
            className="block text-[14px] font-medium text-shop-primary-dark"
          >
            {S.HELP_CONTACT_EMAIL}
          </a>
        </section>

        <section className="mt-8 border-t border-shop-border pt-6 text-center">
          <p className="text-[13px] text-shop-text-secondary">
            Prefer the app? It&apos;s on{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.satwikfarms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-shop-primary-dark"
            >
              Google Play
            </a>{' '}
            and the{' '}
            <a
              href="https://apps.apple.com/us/app/satwikfarms/id6759561187"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-shop-primary-dark"
            >
              App Store
            </a>
            .
          </p>
          <Link href="/" className="mt-4 inline-block text-[13px] text-shop-text-secondary underline">
            Visit satwikfarms.com
          </Link>
        </section>
      </div>
    </>
  );
}
