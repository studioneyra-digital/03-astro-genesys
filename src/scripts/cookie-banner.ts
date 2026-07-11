import { getStoredConsent, storeConsent } from '../lib/cookie-consent';

export function initCookieBanner(): void {
  const banner = document.querySelector<HTMLElement>('#cookieBanner');
  const acceptBtn = document.querySelector<HTMLButtonElement>('#cookieAccept');
  const rejectBtn = document.querySelector<HTMLButtonElement>('#cookieReject');
  if (!banner || !acceptBtn || !rejectBtn) return;

  if (getStoredConsent(window.localStorage) === null) {
    banner.hidden = false;
  }

  acceptBtn.addEventListener('click', () => {
    storeConsent(window.localStorage, 'accepted');
    banner.hidden = true;
  });
  rejectBtn.addEventListener('click', () => {
    storeConsent(window.localStorage, 'rejected');
    banner.hidden = true;
  });
}
