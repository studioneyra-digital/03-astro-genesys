const STORAGE_KEY = 'genesys-cookie-consent';

export type CookieConsent = 'accepted' | 'rejected';

export function getStoredConsent(storage: Pick<Storage, 'getItem'>): CookieConsent | null {
  const value = storage.getItem(STORAGE_KEY);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function storeConsent(storage: Pick<Storage, 'setItem'>, consent: CookieConsent): void {
  storage.setItem(STORAGE_KEY, consent);
}
