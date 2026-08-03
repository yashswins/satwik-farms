/**
 * Customer detail validation.
 *
 * The phone app validates these three different ways depending on which screen
 * you are on (onboarding demands 9-15 digits, checkout accepts 6+ characters,
 * the address screen allows 7-20 digits). That inconsistency is a bug, not a
 * spec — the web app applies one rule everywhere.
 *
 * Kept deliberately permissive: this runs on a customer's phone while they are
 * trying to give us money, so it should catch typos, not enforce a standard.
 */

export const DEFAULT_COUNTRY_CODE = '+255'; // Tanzania

export function sanitizeName(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

/**
 * Strip formatting from a phone number.
 *
 * The cap is 20, not the 15 that validation allows, on purpose: truncating to
 * the valid length would silently turn a mistyped 16-digit number into a
 * plausible-looking wrong one, and we would deliver to it. Anything over 15 is
 * kept intact so validateCustomer can tell the customer to fix it. The cap only
 * exists to stop a paste bomb reaching the API.
 */
export function sanitizePhone(value) {
  return String(value ?? '').replace(/[^\d]/g, '').slice(0, 20);
}

export function sanitizeCountryCode(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '').slice(0, 4);
  return digits ? `+${digits}` : DEFAULT_COUNTRY_CODE;
}

export function sanitizeAddress(value) {
  return String(value ?? '').replace(/[ \t]+/g, ' ').trim().slice(0, 500);
}

export function sanitizeNotes(value) {
  return String(value ?? '').replace(/[ \t]+/g, ' ').trim().slice(0, 500);
}

export function sanitizeEmail(value) {
  return String(value ?? '').trim().toLowerCase().slice(0, 254);
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/**
 * Validate the customer form.
 *
 * Returns `{}` when valid, otherwise `{ field: message }` keyed by field name.
 * Messages are written to be shown directly to a customer.
 */
export function validateCustomer(form) {
  const errors = {};

  const name = sanitizeName(form?.name);
  if (!name) errors.name = 'Please enter your name';
  else if (name.length < 2) errors.name = 'Please enter your full name';

  const phone = sanitizePhone(form?.phone);
  if (!phone) errors.phone = 'Please enter your phone number';
  else if (phone.length < 7) errors.phone = 'That phone number looks too short';
  else if (phone.length > 15) errors.phone = 'That phone number looks too long';

  const address = sanitizeAddress(form?.address);
  if (!address) errors.address = 'Please enter your delivery address';
  else if (address.length < 10) {
    errors.address = 'Please give a bit more detail so we can find you';
  }

  // Email is optional — only complain if they typed something unusable.
  const email = sanitizeEmail(form?.email);
  if (email && !EMAIL_RE.test(email)) errors.email = 'That email address looks incorrect';

  return errors;
}

export function isCustomerComplete(form) {
  return Object.keys(validateCustomer(form)).length === 0;
}

/** Assemble the phone number the backend expects: country code + digits. */
export function fullPhoneNumber(form) {
  return `${sanitizeCountryCode(form?.countryCode)}${sanitizePhone(form?.phone)}`;
}
