'use client';

/**
 * The customer detail fields, shared by the welcome screen and checkout.
 *
 * One component so the two can never drift apart. The phone app has three
 * separate implementations with three different validation rules and one that
 * skips sanitisation entirely — that inconsistency is the bug this avoids.
 */
export default function CustomerFields({ form, errors, onChange, showEmail = true }) {
  const field = (name) => ({
    value: form[name] ?? '',
    onChange: (e) => onChange(name, e.target.value),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const inputClass = (name) =>
    `w-full rounded-shop-sm border bg-shop-surface px-3 py-3 text-[15px] text-shop-text
     placeholder:text-shop-text-tertiary focus:outline-none focus:ring-2
     focus:ring-shop-primary/40 ${errors[name] ? 'border-shop-error' : 'border-shop-border'}`;

  const Error = ({ name }) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1 text-[12px] text-shop-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-[13px] font-medium text-shop-text">
          Your name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Asha Mohamed"
          className={inputClass('name')}
          {...field('name')}
        />
        <Error name="name" />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-[13px] font-medium text-shop-text">
          Phone number
        </label>
        <div className="flex gap-2">
          <input
            id="countryCode"
            type="tel"
            inputMode="tel"
            aria-label="Country code"
            className="w-[76px] rounded-shop-sm border border-shop-border bg-shop-surface px-2
                       py-3 text-center text-[15px] text-shop-text focus:outline-none
                       focus:ring-2 focus:ring-shop-primary/40"
            {...field('countryCode')}
          />
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="712 345 678"
            className={`${inputClass('phone')} flex-1`}
            {...field('phone')}
          />
        </div>
        <Error name="phone" />
        <p className="mt-1 text-[12px] text-shop-text-secondary">
          We&apos;ll use this to confirm your delivery.
        </p>
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-[13px] font-medium text-shop-text">
          Delivery address
        </label>
        <textarea
          id="address"
          rows={3}
          autoComplete="street-address"
          placeholder="Street, area, and a landmark if you have one"
          className={`${inputClass('address')} resize-none`}
          {...field('address')}
        />
        <Error name="address" />
      </div>

      {showEmail && (
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-shop-text">
            Email <span className="font-normal text-shop-text-secondary">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass('email')}
            {...field('email')}
          />
          <Error name="email" />
        </div>
      )}
    </div>
  );
}
