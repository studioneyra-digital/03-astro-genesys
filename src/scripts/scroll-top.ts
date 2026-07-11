import { isElementVisible } from '../lib/scroll-visibility';

export function initScrollTop(): void {
  const btn = document.querySelector<HTMLButtonElement>('.scroll-top');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      btn.classList.toggle('is-visible', isElementVisible(window.scrollY));
    },
    { passive: true }
  );
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
