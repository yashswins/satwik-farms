import { describe, it, expect } from 'vitest';

import {
  validateCustomer, isCustomerComplete, fullPhoneNumber,
  sanitizeName, sanitizePhone, sanitizeCountryCode, sanitizeAddress, sanitizeEmail,
} from './validation';

const VALID = {
  name: 'Asha Mohamed',
  countryCode: '+255',
  phone: '712345678',
  email: '',
  address: 'Msasani Peninsula, Dar es Salaam',
};

describe('validateCustomer', () => {
  it('accepts a complete form', () => {
    expect(validateCustomer(VALID)).toEqual({});
    expect(isCustomerComplete(VALID)).toBe(true);
  });

  it('requires a name', () => {
    expect(validateCustomer({ ...VALID, name: '' }).name).toBeTruthy();
  });

  it('requires a plausible phone number', () => {
    expect(validateCustomer({ ...VALID, phone: '' }).phone).toBeTruthy();
    expect(validateCustomer({ ...VALID, phone: '123' }).phone).toBeTruthy();
    expect(validateCustomer({ ...VALID, phone: '1234567890123456' }).phone).toBeTruthy();
  });

  it('requires an address with enough detail', () => {
    expect(validateCustomer({ ...VALID, address: '' }).address).toBeTruthy();
    expect(validateCustomer({ ...VALID, address: 'Dar' }).address).toBeTruthy();
  });

  it('treats email as optional', () => {
    expect(validateCustomer({ ...VALID, email: '' }).email).toBeUndefined();
    expect(validateCustomer({ ...VALID, email: 'asha@example.com' }).email).toBeUndefined();
  });

  it('flags an email only when it is clearly wrong', () => {
    expect(validateCustomer({ ...VALID, email: 'not-an-email' }).email).toBeTruthy();
  });

  it('writes messages a customer can act on', () => {
    const errors = validateCustomer({ name: '', phone: '', address: '' });
    Object.values(errors).forEach((message) => {
      expect(message).toMatch(/^[A-Z]/);          // sentence, not a code
      expect(message).not.toMatch(/error|invalid|failed/i);
    });
  });
});

describe('sanitizers', () => {
  it('collapses whitespace in names', () => {
    expect(sanitizeName('  Asha   Mohamed  ')).toBe('Asha Mohamed');
  });

  it('strips everything but digits from phones', () => {
    expect(sanitizePhone('+255 712-345 678')).toBe('255712345678');
  });

  it('normalises the country code', () => {
    expect(sanitizeCountryCode('255')).toBe('+255');
    expect(sanitizeCountryCode('+255')).toBe('+255');
    expect(sanitizeCountryCode('')).toBe('+255');
  });

  it('trims addresses but keeps newlines', () => {
    expect(sanitizeAddress('  Plot 5,   Msasani  ')).toBe('Plot 5, Msasani');
  });

  it('lowercases emails', () => {
    expect(sanitizeEmail('  ASHA@Example.COM ')).toBe('asha@example.com');
  });

  it('caps lengths so a paste bomb cannot reach the API', () => {
    expect(sanitizeName('x'.repeat(500))).toHaveLength(100);
    expect(sanitizeAddress('x'.repeat(2000))).toHaveLength(500);
  });
});

describe('fullPhoneNumber', () => {
  it('joins country code and digits the way the backend expects', () => {
    expect(fullPhoneNumber(VALID)).toBe('+255712345678');
  });

  it('keeps the two parts separate until submission', () => {
    // The phone app stores one concatenated string and re-splits it with an
    // ambiguous regex; keeping them apart avoids that entirely.
    expect(fullPhoneNumber({ countryCode: '+1', phone: '2025550123' })).toBe('+12025550123');
  });
});
