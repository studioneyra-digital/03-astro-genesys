import { isValidEmail } from '../lib/form-validation';

export function initNewsletterForm(): void {
  const form = document.querySelector<HTMLFormElement>('#newsletterForm');
  const success = document.querySelector<HTMLElement>('#newsletterSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector<HTMLInputElement>('.newsletter__input');
    if (!input || !isValidEmail(input.value)) {
      input?.classList.add('error');
      return;
    }
    input.classList.remove('error');
    form.style.display = 'none';
    success.style.display = 'flex';
  });
}
