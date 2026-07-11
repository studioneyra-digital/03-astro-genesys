export function initScrollReveal(): void {
  if (!window.WOW) return;

  try {
    const wow = new window.WOW({ live: false, animateClass: 'animate__animated', offset: 80 });
    wow.init();
    window.addEventListener('load', () => {
      try {
        wow.sync();
      } catch {
        // WOW.js has no elements to sync yet — ignore.
      }
    });

    const sweep = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll<HTMLElement>('.wow').forEach((el) => {
        if (el.style.visibility === 'hidden' && el.getBoundingClientRect().top < vh) {
          el.style.visibility = 'visible';
          el.classList.add('animate__animated');
        }
      });
    };
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(sweep, 180);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', () => setTimeout(sweep, 220));
  } catch {
    // WOW.js failed to initialize — page remains usable without scroll-reveal.
  }
}
