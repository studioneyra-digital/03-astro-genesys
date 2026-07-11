export interface ContactFormValues {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const name = values.name.trim();
  if (!name || name.length < 2) {
    errors.name = 'Ingresa tu nombre (mínimo 2 caracteres).';
  }

  const email = values.email.trim();
  if (!email || !isValidEmail(email)) {
    errors.email = 'Ingresa un email válido.';
  }

  const company = values.company.trim();
  if (!company || company.length < 2) {
    errors.company = 'Ingresa el nombre de tu empresa.';
  }

  const phone = values.phone.trim();
  const phoneDigits = phone.replace(/\D/g, '');
  if (phone && phoneDigits.length < 7) {
    errors.phone = 'El teléfono debe tener al menos 7 dígitos.';
  }

  if (!values.service.trim()) {
    errors.service = 'Selecciona un servicio de interés.';
  }

  const message = values.message.trim();
  if (!message || message.length < 10) {
    errors.message = 'Cuéntanos un poco más (mínimo 10 caracteres).';
  }

  return errors;
}
