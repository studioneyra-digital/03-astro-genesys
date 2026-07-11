import { isNavScrolled } from '../lib/nav-scroll';

export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', isNavScrolled(window.scrollY));
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = nav.querySelector<HTMLButtonElement>('.nav__toggle');
  const menu = nav.querySelector<HTMLElement>('.nav__menu');
  const backdrop = document.querySelector<HTMLElement>('.nav__backdrop');
  if (!toggle || !menu) return;

  const setOpen = (open: boolean) => {
    menu.classList.toggle('is-open', open);
    backdrop?.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    toggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
    window.lucide?.createIcons();
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  menu.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
  backdrop?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setOpen(false);
  });
}
