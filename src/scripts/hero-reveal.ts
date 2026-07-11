export function initHeroReveal(): void {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const animate = document.documentElement.classList.contains('hero-anim');
  const lines = hero.querySelectorAll<HTMLElement>('.hero__line > span');
  const items = hero.querySelectorAll<HTMLElement>('.hero__reveal');

  if (!animate || !window.gsap) {
    lines.forEach((l) => {
      l.style.opacity = '1';
      l.style.transform = 'none';
    });
    items.forEach((i) => {
      i.style.opacity = '1';
      i.style.transform = 'none';
    });
    return;
  }

  window.gsap.set(lines, { yPercent: 110, opacity: 1 });
  window.gsap.set(items, { opacity: 0, y: 16 });
  const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (lines.length) tl.to(lines, { yPercent: 0, duration: 0.9, stagger: 0.12 });
  if (items.length) tl.to(items, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.55');
}
