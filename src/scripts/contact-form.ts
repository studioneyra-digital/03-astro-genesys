import { validateContactForm, type ContactFormValues } from '../lib/form-validation';

const FIELD_IDS: Record<keyof ContactFormValues, string> = {
  name: 'c-name',
  email: 'c-email',
  company: 'c-company',
  phone: 'c-phone',
  service: 'c-service',
  message: 'c-msg',
};

function fieldValue(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return el?.value ?? '';
}

function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll('.form-control').forEach((el) => el.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach((el) => el.remove());
}

function showFieldError(id: string, message: string): void {
  const input = document.getElementById(id);
  if (!input) return;
  input.classList.add('error');
  const err = document.createElement('span');
  err.className = 'form-error';
  err.textContent = message;
  input.closest('.form-group')?.appendChild(err);
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contactForm');
  const success = document.querySelector<HTMLElement>('#contactSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(form);

    const values: ContactFormValues = {
      name: fieldValue(FIELD_IDS.name),
      email: fieldValue(FIELD_IDS.email),
      company: fieldValue(FIELD_IDS.company),
      phone: fieldValue(FIELD_IDS.phone),
      service: fieldValue(FIELD_IDS.service),
      message: fieldValue(FIELD_IDS.message),
    };

    const errors = validateContactForm(values);
    const errorKeys = Object.keys(errors) as (keyof ContactFormValues)[];

    if (errorKeys.length > 0) {
      errorKeys.forEach((key) => showFieldError(FIELD_IDS[key], errors[key]!));
      return;
    }

    // TODO: conectar a un backend real (ej. FormSubmit.co) cuando el
    // proyecto que reuse este starter lo necesite. Por ahora solo se
    // simula el éxito del envío, sin llamada de red.
    form.style.display = 'none';
    success.style.display = 'flex';
  });
}
