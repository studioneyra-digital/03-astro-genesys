import { describe, it, expect, vi } from 'vitest';
import { getStoredConsent, storeConsent } from './cookie-consent';

function createFakeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
}

describe('cookie consent storage', () => {
  it('returns null when nothing is stored', () => {
    const storage = createFakeStorage();
    expect(getStoredConsent(storage)).toBeNull();
  });

  it('returns null for an unrecognized stored value', () => {
    const storage = createFakeStorage();
    storage.setItem('genesys-cookie-consent', 'garbage');
    expect(getStoredConsent(storage)).toBeNull();
  });

  it('round-trips an accepted consent', () => {
    const storage = createFakeStorage();
    storeConsent(storage, 'accepted');
    expect(getStoredConsent(storage)).toBe('accepted');
  });

  it('round-trips a rejected consent', () => {
    const storage = createFakeStorage();
    storeConsent(storage, 'rejected');
    expect(getStoredConsent(storage)).toBe('rejected');
  });
});
