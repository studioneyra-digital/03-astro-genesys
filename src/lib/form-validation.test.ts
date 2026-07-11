import { describe, it, expect } from 'vitest';
import { isValidEmail, validateContactForm, type ContactFormValues } from './form-validation';

const validValues: ContactFormValues = {
  name: 'Juan García',
  email: 'juan@empresa.com',
  company: 'Empresa SAC',
  phone: '',
  service: 'Diseño web',
  message: 'Quisiera cotizar un rediseño completo de nuestro sitio.',
};

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('juan@empresa.com')).toBe(true);
  });

  it('rejects a string without an @', () => {
    expect(isValidEmail('no-es-email')).toBe(false);
  });

  it('rejects an email without a domain suffix', () => {
    expect(isValidEmail('juan@empresa')).toBe(false);
  });
});

describe('validateContactForm', () => {
  it('returns no errors for fully valid values', () => {
    expect(validateContactForm(validValues)).toEqual({});
  });

  it('requires a name of at least 2 characters', () => {
    const errors = validateContactForm({ ...validValues, name: 'J' });
    expect(errors.name).toBeDefined();
  });

  it('requires a valid email', () => {
    const errors = validateContactForm({ ...validValues, email: 'no-es-email' });
    expect(errors.email).toBeDefined();
  });

  it('requires a company name', () => {
    const errors = validateContactForm({ ...validValues, company: '' });
    expect(errors.company).toBeDefined();
  });

  it('allows an empty phone (optional field)', () => {
    const errors = validateContactForm({ ...validValues, phone: '' });
    expect(errors.phone).toBeUndefined();
  });

  it('rejects a phone with fewer than 7 digits when provided', () => {
    const errors = validateContactForm({ ...validValues, phone: '12345' });
    expect(errors.phone).toBeDefined();
  });

  it('requires a service selection', () => {
    const errors = validateContactForm({ ...validValues, service: '' });
    expect(errors.service).toBeDefined();
  });

  it('requires a message of at least 10 characters', () => {
    const errors = validateContactForm({ ...validValues, message: 'corto' });
    expect(errors.message).toBeDefined();
  });
});
