# Astro Genesys Starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the "Genesys" static HTML UI-kit (Bootstrap-grid + jQuery-free vanilla JS) into a reusable Astro starter with ~20 components, 4 content collections, and 6 pages, ready for Docker deployment.

**Architecture:** Astro `output: 'static'`, no UI framework — plain `.astro` markup consuming the UI-kit's existing `main.css` unmodified, plus small ES module scripts colocated with each interactive component. Pure logic (nav scroll threshold, counter stepping, cookie consent storage, form validation) lives in dependency-injected, unit-tested `src/lib/*.ts` modules; DOM wiring lives in untested `src/scripts/*.ts` thin wrappers verified manually in the browser.

**Tech Stack:** Astro 5, TypeScript (strict), pnpm, Vitest, vendored Bootstrap-grid/Animate.css/Swiper/WOW.js/GSAP+ScrollTrigger, Lucide Icons (CDN).

## Global Constraints

- Node.js >= 20.3.0 (Astro 5 requirement).
- pnpm as package manager — never use npm/yarn commands in this project.
- `astro.config.mjs` uses `output: 'static'`.
- No UI framework integration (no React/Vue/Svelte/Alpine) — vanilla TS modules only.
- `public/assets/css/main.css` and the other vendored CSS/JS files are copied byte-for-byte from the source UI-kit and must never be edited.
- All pages use `<html lang="es">`.
- Formularios (contacto + newsletter): validación + estado de éxito simulado en el cliente únicamente — **nunca** un `fetch`/envío real ni un email hardcodeado. Marcar el punto de integración futura con `// TODO`.
- El botón de WhatsApp (`WhatsAppButton.astro`) solo se renderiza si `PUBLIC_WHATSAPP_NUMBER` está definido.
- Colores/tipografía/tokens: usar siempre las clases y variables CSS ya definidas en `main.css` (ver nombres exactos en cada tarea) — no inventar clases nuevas.
- Contenido de muestra: marca ficticia "Genesys" (tech/B2B), `hola@genesys.io`, `+51 1 234 5678`, Lima, Perú — igual que el `index.html` original del UI-kit.

---

## Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/env.d.ts`
- Create: `public/favicon.svg`
- Create: `src/pages/index.astro` (temporary placeholder, replaced in Task 23)

**Interfaces:**
- Produces: `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm check`, `pnpm test` scripts that every later task relies on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "astro-genesys",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Create `src/env.d.ts`**

```ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
    Swiper?: new (el: Element | string, options?: Record<string, unknown>) => unknown;
    WOW?: new (options?: Record<string, unknown>) => { init: () => void; sync: () => void };
    gsap?: {
      set: (targets: unknown, vars: Record<string, unknown>) => void;
      timeline: (vars?: Record<string, unknown>) => {
        to: (targets: unknown, vars: Record<string, unknown>, position?: string) => unknown;
      };
    };
  }
}

export {};
```

- [ ] **Step 6: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1944DF"/>
  <text x="16" y="22" font-family="sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">G</text>
</svg>
```

- [ ] **Step 7: Create a temporary placeholder page**

```astro
---
// Reemplazado en la Tarea 23 por la página real.
---
<p>Astro Genesys Starter — scaffold OK</p>
```

Save as `src/pages/index.astro`.

- [ ] **Step 8: Install dependencies**

Run: `pnpm install`
Expected: lockfile `pnpm-lock.yaml` created, no errors.

- [ ] **Step 9: Verify the build works**

Run: `pnpm build`
Expected: `Complete!` message, `dist/index.html` exists containing "scaffold OK".

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json vitest.config.ts src/env.d.ts public/favicon.svg src/pages/index.astro
git commit -m "chore: scaffold Astro project with pnpm, TS strict, Vitest"
```

---

## Task 2: Vendor the UI-kit static assets

**Files:**
- Create: `public/assets/css/animate.min.css`
- Create: `public/assets/css/bootstrap-grid.min.css`
- Create: `public/assets/css/swiper-bundle.min.css`
- Create: `public/assets/css/main.css`
- Create: `public/assets/js/swiper-bundle.min.js`
- Create: `public/assets/js/wow.min.js`
- Create: `public/assets/js/gsap.min.js`
- Create: `public/assets/js/ScrollTrigger.min.js`

**Interfaces:**
- Produces: `/assets/css/*.css` and `/assets/js/*.js` URLs that `BaseLayout.astro` (Task 4) loads globally. `main.css` provides every class name used by every component in this plan (`.btn`, `.badge`, `.card`, `.nav`, `.hero`, `.footer`, `.cta-band`, `.service-card`, `.project-card`, `.plan-card`, `.newsletter`, `.contact-strip`, `.testimonial-card`, `.logos-grid`, `.process-grid`, `.stats-grid`, `.kit-*`, etc.) — do not redefine any of these classes elsewhere.

- [ ] **Step 1: Copy the CSS files from the UI-kit source repo**

Clone the source UI-kit into a temp directory and copy its `assets/css` and `assets/js` files verbatim (skip `jquery-3.7.1.min.js` and `main.js` — those are not vendored, per the Global Constraints: no jQuery, and `main.js`'s behavior is rebuilt from scratch as ES modules in later tasks):

```bash
git clone --depth 1 https://github.com/studioneyra-digital/01-genesys-starter-2.git /tmp/genesys-uikit-source
mkdir -p public/assets/css public/assets/js
cp /tmp/genesys-uikit-source/assets/css/animate.min.css public/assets/css/
cp /tmp/genesys-uikit-source/assets/css/bootstrap-grid.min.css public/assets/css/
cp /tmp/genesys-uikit-source/assets/css/swiper-bundle.min.css public/assets/css/
cp /tmp/genesys-uikit-source/assets/css/main.css public/assets/css/
cp /tmp/genesys-uikit-source/assets/js/swiper-bundle.min.js public/assets/js/
cp /tmp/genesys-uikit-source/assets/js/wow.min.js public/assets/js/
cp /tmp/genesys-uikit-source/assets/js/gsap.min.js public/assets/js/
cp /tmp/genesys-uikit-source/assets/js/ScrollTrigger.min.js public/assets/js/
rm -rf /tmp/genesys-uikit-source
```

- [ ] **Step 2: Verify all 8 files are present**

Run: `ls public/assets/css public/assets/js`
Expected: `animate.min.css bootstrap-grid.min.css main.css swiper-bundle.min.css` and `ScrollTrigger.min.js gsap.min.js swiper-bundle.min.js wow.min.js`.

- [ ] **Step 3: Confirm `main.css` was not modified**

Run: `git diff --stat public/assets/`
Expected: only new files shown (no diffs against source, since these are freshly copied and untracked before this commit).

- [ ] **Step 4: Commit**

```bash
git add public/assets/
git commit -m "chore: vendor UI-kit CSS/JS assets (no jQuery, no main.js)"
```

---

## Task 3: Pure logic module — nav scroll threshold

**Files:**
- Create: `src/lib/nav-scroll.ts`
- Test: `src/lib/nav-scroll.test.ts`

**Interfaces:**
- Produces: `isNavScrolled(scrollY: number, threshold?: number): boolean` — consumed by `src/scripts/nav.ts` (Task 5).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isNavScrolled } from './nav-scroll';

describe('isNavScrolled', () => {
  it('is false at the top of the page', () => {
    expect(isNavScrolled(0)).toBe(false);
  });

  it('is false exactly at the 60px threshold', () => {
    expect(isNavScrolled(60)).toBe(false);
  });

  it('is true just past the 60px threshold', () => {
    expect(isNavScrolled(61)).toBe(true);
  });

  it('supports a custom threshold', () => {
    expect(isNavScrolled(150, 100)).toBe(true);
    expect(isNavScrolled(50, 100)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/nav-scroll.test.ts`
Expected: FAIL — `Cannot find module './nav-scroll'`.

- [ ] **Step 3: Write minimal implementation**

```ts
export function isNavScrolled(scrollY: number, threshold = 60): boolean {
  return scrollY > threshold;
}
```

Save as `src/lib/nav-scroll.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/nav-scroll.test.ts`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav-scroll.ts src/lib/nav-scroll.test.ts
git commit -m "feat: add isNavScrolled pure logic with tests"
```

---

## Task 4: BaseLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: nothing from earlier tasks (uses vendored assets from Task 2).
- Produces: `BaseLayout` Astro component with `Props { title: string; description: string; ogImage?: string }` and a default `<slot />` for page body content. Every page (Tasks 23–29) and `PageLayout.astro` (Task 12) wraps its content in this component.

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  title: string;
  description: string;
  ogImage?: string;
}
const { title, description, ogImage = '/assets/img/og-image.jpg' } = Astro.props;
---
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

  <script is:inline>
    (function () {
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!mq || !mq.matches) document.documentElement.classList.add('hero-anim');
    })();
  </script>

  <link rel="stylesheet" href="/assets/css/animate.min.css" />
  <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
  <link rel="stylesheet" href="/assets/css/bootstrap-grid.min.css" />
  <link rel="stylesheet" href="/assets/css/main.css" />
</head>
<body>
  <slot />

  <script src="/assets/js/swiper-bundle.min.js"></script>
  <script src="/assets/js/wow.min.js"></script>
  <script src="/assets/js/gsap.min.js"></script>
  <script src="/assets/js/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script is:inline>
    document.addEventListener('DOMContentLoaded', function () {
      if (window.lucide) window.lucide.createIcons();
    });
  </script>
</body>
</html>
```

Save as `src/layouts/BaseLayout.astro`.

- [ ] **Step 2: Point the placeholder page at it to verify wiring**

Replace `src/pages/index.astro` (Task 1) contents with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Genesys | Starter Theme" description="Scaffold check">
  <p>Astro Genesys Starter — BaseLayout OK</p>
</BaseLayout>
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: `Complete!`, and `dist/index.html` contains `<html lang="es">` and the four vendored `<link rel="stylesheet">` tags.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: add BaseLayout with SEO meta and vendored asset loading"
```

---

## Task 5: Nav component

**Files:**
- Create: `src/scripts/nav.ts`
- Create: `src/components/sections/Nav.astro`

**Interfaces:**
- Consumes: `isNavScrolled` from `src/lib/nav-scroll.ts` (Task 3).
- Produces: `Nav` Astro component with `Props { variant?: 'default' | 'over-hero' }`, and `initNav(): void` used only internally by this component's own `<script>` tag.

- [ ] **Step 1: Write `src/scripts/nav.ts`**

```ts
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
```

- [ ] **Step 2: Write `src/components/sections/Nav.astro`**

```astro
---
interface Props {
  variant?: 'default' | 'over-hero';
}
const { variant = 'default' } = Astro.props;
const navClass = variant === 'over-hero' ? 'nav nav--over-hero' : 'nav';
const links = [
  { href: '/about-us', label: 'Nosotros' },
  { href: '/services', label: 'Servicios' },
  { href: '/projects', label: 'Proyectos' },
  { href: '/clients', label: 'Clientes' },
  { href: '/contact-us', label: 'Contacto' },
];
---
<nav class={navClass} aria-label="Navegación principal">
  <div class="nav__inner">
    <a href="/" class="nav__wordmark">Genesys</a>
    <div class="nav__menu" role="navigation">
      {links.map((link) => <a href={link.href} class="nav__link">{link.label}</a>)}
    </div>
    <div class="nav__actions">
      <a href="/contact-us" class="btn btn-primary btn-sm">Agendar llamada</a>
      <button class="nav__toggle" aria-label="Abrir menú" aria-expanded="false">
        <i data-lucide="menu"></i>
      </button>
    </div>
  </div>
</nav>
<div class="nav__backdrop" aria-hidden="true"></div>
<script>
  import { initNav } from '../../scripts/nav';
  initNav();
</script>
```

- [ ] **Step 3: Wire it into the placeholder page and verify in the browser**

Replace the body of `src/pages/index.astro` with `<Nav variant="over-hero" />` (import from `'../components/sections/Nav.astro'`).

Run: `pnpm dev`, open `http://localhost:4321`.
Expected: a fixed nav bar with the "Genesys" wordmark, 5 links, and an "Agendar llamada" button. Scrolling past 60px adds a frosted-glass background (`.is-scrolled`). Shrinking the viewport below 768px and clicking the hamburger opens the off-canvas menu with a backdrop; pressing Escape or clicking a link closes it.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/nav.ts src/components/sections/Nav.astro src/pages/index.astro
git commit -m "feat: add Nav component with scroll state and off-canvas mobile menu"
```

---

## Task 6: Footer component

**Files:**
- Create: `src/components/sections/Footer.astro`

**Interfaces:**
- Consumes: nothing.
- Produces: `Footer` Astro component, no props (static brand content), used by `PageLayout.astro` (Task 12).

- [ ] **Step 1: Write the component**

```astro
<footer class="footer" aria-label="Pie de página">
  <div class="container">
    <div class="footer__top">
      <div>
        <div class="footer__wordmark">Genesys</div>
        <p class="footer__tagline">
          Construimos productos digitales que crecen con tu negocio. Tecnología con propósito,
          diseño con intención.
        </p>
        <div class="footer__socials">
          <a href="#" class="footer__social-link" aria-label="LinkedIn"><i data-lucide="linkedin"></i></a>
          <a href="#" class="footer__social-link" aria-label="Instagram"><i data-lucide="instagram"></i></a>
          <a href="#" class="footer__social-link" aria-label="Twitter/X"><i data-lucide="twitter"></i></a>
          <a href="#" class="footer__social-link" aria-label="GitHub"><i data-lucide="github"></i></a>
        </div>
      </div>
      <div>
        <p class="footer__col-title">Servicios</p>
        <div class="footer__links">
          <a href="/services" class="footer__link">Diseño web</a>
          <a href="/services" class="footer__link">Desarrollo frontend</a>
          <a href="/services" class="footer__link">Estrategia digital</a>
          <a href="/services" class="footer__link">Automatizaciones IA</a>
        </div>
      </div>
      <div>
        <p class="footer__col-title">Empresa</p>
        <div class="footer__links">
          <a href="/about-us" class="footer__link">Nosotros</a>
          <a href="/projects" class="footer__link">Proyectos</a>
          <a href="/clients" class="footer__link">Clientes</a>
        </div>
      </div>
      <div>
        <p class="footer__col-title">Contacto</p>
        <div class="footer__links">
          <a href="mailto:hola@genesys.io" class="footer__link">hola@genesys.io</a>
          <a href="tel:+5112345678" class="footer__link">+51 1 234 5678</a>
          <span class="footer__link" style="cursor:default;">Lima, Perú</span>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <span>&copy; 2026 Genesys. Todos los derechos reservados.</span>
      <div style="display:flex; gap:var(--space-5);">
        <a href="#" class="footer__link">Privacidad</a>
        <a href="#" class="footer__link">Términos</a>
      </div>
    </div>
  </div>
</footer>
```

Save as `src/components/sections/Footer.astro`.

- [ ] **Step 2: Add it to the placeholder page and verify in the browser**

Add `<Footer />` below `<Nav variant="over-hero" />` in `src/pages/index.astro`.

Run: `pnpm dev`, reload the page.
Expected: navy footer with wordmark, tagline, 4 social icons, 3 link columns, and a bottom bar with copyright + Privacidad/Términos links.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Footer.astro src/pages/index.astro
git commit -m "feat: add Footer component"
```

---

## Task 7: Pure logic module — scroll-based visibility, plus ScrollTop component

**Files:**
- Create: `src/lib/scroll-visibility.ts`
- Test: `src/lib/scroll-visibility.test.ts`
- Create: `src/scripts/scroll-top.ts`
- Create: `src/components/elements/ScrollTop.astro`

**Interfaces:**
- Produces: `isElementVisible(scrollY: number, threshold?: number): boolean` (default threshold 300, reused conceptually by any future scroll-triggered element). `ScrollTop` Astro component, no props.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isElementVisible } from './scroll-visibility';

describe('isElementVisible', () => {
  it('is false before the default 300px threshold', () => {
    expect(isElementVisible(0)).toBe(false);
    expect(isElementVisible(300)).toBe(false);
  });

  it('is true past the default 300px threshold', () => {
    expect(isElementVisible(301)).toBe(true);
  });

  it('supports a custom threshold', () => {
    expect(isElementVisible(50, 40)).toBe(true);
  });
});
```

Save as `src/lib/scroll-visibility.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/scroll-visibility.test.ts`
Expected: FAIL — `Cannot find module './scroll-visibility'`.

- [ ] **Step 3: Write minimal implementation**

```ts
export function isElementVisible(scrollY: number, threshold = 300): boolean {
  return scrollY > threshold;
}
```

Save as `src/lib/scroll-visibility.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/scroll-visibility.test.ts`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: Write `src/scripts/scroll-top.ts`**

```ts
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
```

- [ ] **Step 6: Write `src/components/elements/ScrollTop.astro`**

```astro
<button id="scrollTop" class="scroll-top scroll-top--right" aria-label="Volver arriba">
  <i data-lucide="arrow-up"></i>
</button>
<script>
  import { initScrollTop } from '../../scripts/scroll-top';
  initScrollTop();
</script>
```

- [ ] **Step 7: Add it to the placeholder page and verify in the browser**

Add `<ScrollTop />` to `src/pages/index.astro`.

Run: `pnpm dev`. Scroll down past 300px.
Expected: the round arrow-up button fades in at the bottom-right and smooth-scrolls to the top when clicked.

- [ ] **Step 8: Commit**

```bash
git add src/lib/scroll-visibility.ts src/lib/scroll-visibility.test.ts src/scripts/scroll-top.ts src/components/elements/ScrollTop.astro src/pages/index.astro
git commit -m "feat: add ScrollTop component with tested visibility threshold"
```

---

## Task 8: Hero and Sub-hero components

**Files:**
- Create: `src/scripts/hero-reveal.ts`
- Create: `src/components/sections/Hero.astro`
- Create: `src/components/sections/SubHero.astro`

**Interfaces:**
- Produces: `Hero` with `Props { eyebrowText: string; sub: string; bgImage: string; ctaPrimary: {label:string;href:string}; ctaSecondary?: {label:string;href:string}; note?: string }` and a named `title` slot. `SubHero` with `Props { eyebrow: string; title: string; breadcrumb: {label:string; href?:string}[] }`.

- [ ] **Step 1: Write `src/scripts/hero-reveal.ts`**

```ts
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
```

- [ ] **Step 2: Write `src/components/sections/Hero.astro`**

```astro
---
interface CtaLink {
  label: string;
  href: string;
}
interface Props {
  eyebrowText: string;
  sub: string;
  bgImage: string;
  ctaPrimary: CtaLink;
  ctaSecondary?: CtaLink;
  note?: string;
}
const { eyebrowText, sub, bgImage, ctaPrimary, ctaSecondary, note } = Astro.props;
---
<section class="hero" aria-labelledby="hero-title">
  <img class="hero__bg" src={bgImage} alt="" aria-hidden="true" loading="eager" />
  <div class="hero__overlay" aria-hidden="true"></div>
  <div class="hero-blob hero-blob--1" aria-hidden="true"></div>
  <div class="hero-blob hero-blob--2" aria-hidden="true"></div>
  <div class="container">
    <div class="hero__content">
      <span class="eyebrow eyebrow--inverse hero__reveal">{eyebrowText}</span>
      <h1 class="hero__title" id="hero-title">
        <slot name="title" />
      </h1>
      <p class="hero__sub hero__reveal">{sub}</p>
      <div class="hero__ctas hero__reveal">
        <a href={ctaPrimary.href} class="btn btn-primary">{ctaPrimary.label}</a>
        {ctaSecondary && <a href={ctaSecondary.href} class="btn btn-outline-light">{ctaSecondary.label}</a>}
      </div>
      {note && (
        <p class="hero__note hero__reveal">
          <i data-lucide="shield-check"></i>
          {note}
        </p>
      )}
    </div>
  </div>
</section>
<script>
  import { initHeroReveal } from '../../scripts/hero-reveal';
  initHeroReveal();
</script>
```

- [ ] **Step 3: Write `src/components/sections/SubHero.astro`**

```astro
---
interface Crumb {
  label: string;
  href?: string;
}
interface Props {
  eyebrow: string;
  title: string;
  breadcrumb: Crumb[];
}
const { eyebrow, title, breadcrumb } = Astro.props;
---
<section class="subhero">
  <div class="subhero__inner">
    <div class="container">
      <span class="eyebrow">{eyebrow}</span>
      <h1 class="subhero__title">{title}</h1>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        {breadcrumb.map((crumb, i) => (
          <Fragment>
            {i > 0 && <span>›</span>}
            {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span>{crumb.label}</span>}
          </Fragment>
        ))}
      </nav>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Wire Hero into the placeholder page and verify in the browser**

Replace the page body with the real index hero content:

```astro
<Hero
  eyebrowText="Tecnología · Estrategia · Resultados"
  sub="Somos un equipo de ingenieros, diseñadores y estrategas obsesionados con crear productos digitales que generan impacto real. Sin humo, sin atajos."
  bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80&auto=format&fit=crop"
  ctaPrimary={{ label: 'Conoce nuestra historia', href: '#about' }}
  ctaSecondary={{ label: 'Ver proyectos', href: '/projects' }}
  note="Más de 120 proyectos entregados en 8 países"
>
  <Fragment slot="title">
    <span class="hero__line"><span>Construimos el</span></span>
    <span class="hero__line"><span>futuro digital de <span class="accent">tu empresa</span></span></span>
    <span class="hero__line"><span>desde hoy.</span></span>
  </Fragment>
</Hero>
```

Run: `pnpm dev`.
Expected: full-bleed dark hero with background image + overlay, 3-line title revealing on load (top line, accent line, closing line), subtitle, two CTA buttons, and the "120 proyectos" note — matching the original `index.html` hero exactly.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/hero-reveal.ts src/components/sections/Hero.astro src/components/sections/SubHero.astro src/pages/index.astro
git commit -m "feat: add Hero and SubHero components with reveal animation"
```

---

## Task 9: CtaBand component

**Files:**
- Create: `src/components/sections/CtaBand.astro`

**Interfaces:**
- Produces: `CtaBand` with `Props { title: string; text: string; ctaPrimary: {label:string;href:string}; ctaSecondary?: {label:string;href:string}; variant?: 'accent'|'dark'|'light' }`, used by `PageLayout.astro` (Task 12).

- [ ] **Step 1: Write the component**

```astro
---
interface CtaLink {
  label: string;
  href: string;
}
interface Props {
  title: string;
  text: string;
  ctaPrimary: CtaLink;
  ctaSecondary?: CtaLink;
  variant?: 'accent' | 'dark' | 'light';
}
const { title, text, ctaPrimary, ctaSecondary, variant = 'accent' } = Astro.props;
const bandClass = variant === 'accent' ? 'cta-band' : `cta-band cta-band--${variant}`;
---
<div class={bandClass}>
  <div class="cta-band__inner">
    <h2 class="cta-band__title">{title}</h2>
    <p class="cta-band__text">{text}</p>
    <div class="cta-band__btns">
      <a href={ctaPrimary.href} class="btn btn-primary">{ctaPrimary.label}</a>
      {ctaSecondary && <a href={ctaSecondary.href} class="btn btn-outline-light">{ctaSecondary.label}</a>}
    </div>
  </div>
</div>
```

Save as `src/components/sections/CtaBand.astro`.

- [ ] **Step 2: Add it to the placeholder page and verify in the browser**

Add below the hero:

```astro
<CtaBand
  title="¿Listo para dar el siguiente paso?"
  text="Agenda una consulta gratuita y descubre cómo podemos impulsar tu negocio digital."
  ctaPrimary={{ label: 'Agendar ahora', href: '/contact-us' }}
  ctaSecondary={{ label: 'Ver proyectos', href: '/projects' }}
/>
```

Run: `pnpm dev`.
Expected: an accent-colored band with title, text, and two buttons.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/CtaBand.astro src/pages/index.astro
git commit -m "feat: add CtaBand component"
```

---

## Task 10: Basic elements — Button, Badge, Eyebrow, Card, Alert

**Files:**
- Create: `src/components/elements/Button.astro`
- Create: `src/components/elements/Badge.astro`
- Create: `src/components/elements/Eyebrow.astro`
- Create: `src/components/elements/Card.astro`
- Create: `src/components/elements/Alert.astro`

**Interfaces:**
- Produces: `Button` `Props { href?: string; variant?: 'primary'|'outline'|'outline-light'|'ghost'; size?: 'sm'|'lg'; shape?: 'sharp'|'soft'|'pill'; block?: boolean; type?: 'button'|'submit' }` with a default slot. `Badge` `Props { variant?: 'accent'|'dark'|'light' }`. `Eyebrow` `Props { inverse?: boolean; plain?: boolean }`. `Card` `Props { variant?: 'base'|'dark'|'feature'|'glass'; icon?: string; iconOnDark?: boolean }`. `Alert` `Props { variant: 'info'|'success'|'warning'|'error'; icon: string; title?: string; dismissible?: boolean }`.

- [ ] **Step 1: Write `src/components/elements/Button.astro`**

```astro
---
interface Props {
  href?: string;
  variant?: 'primary' | 'outline' | 'outline-light' | 'ghost';
  size?: 'sm' | 'lg';
  shape?: 'sharp' | 'soft' | 'pill';
  block?: boolean;
  type?: 'button' | 'submit';
}
const { href, variant = 'primary', size, shape, block = false, type = 'button' } = Astro.props;
const classes = [
  'btn',
  `btn-${variant}`,
  size && `btn-${size}`,
  shape && `btn-${shape}`,
  block && 'btn-block',
]
  .filter(Boolean)
  .join(' ');
const Tag = href ? 'a' : 'button';
---
<Tag class={classes} href={href} type={href ? undefined : type}>
  <slot />
</Tag>
```

- [ ] **Step 2: Write `src/components/elements/Badge.astro`**

```astro
---
interface Props {
  variant?: 'accent' | 'dark' | 'light';
}
const { variant = 'accent' } = Astro.props;
---
<span class={`badge badge--${variant}`}><slot /></span>
```

- [ ] **Step 3: Write `src/components/elements/Eyebrow.astro`**

```astro
---
interface Props {
  inverse?: boolean;
  plain?: boolean;
}
const { inverse = false, plain = false } = Astro.props;
const classes = ['eyebrow', inverse && 'eyebrow--inverse', plain && 'eyebrow--plain'].filter(Boolean).join(' ');
---
<span class={classes}><slot /></span>
```

- [ ] **Step 4: Write `src/components/elements/Card.astro`**

```astro
---
interface Props {
  variant?: 'base' | 'dark' | 'feature' | 'glass';
  icon?: string;
  iconOnDark?: boolean;
}
const { variant = 'base', icon, iconOnDark = false } = Astro.props;
const cardClass = variant === 'base' ? 'card' : `card card--${variant}`;
const iconClass = iconOnDark ? 'icon-box icon-box--ondark' : 'icon-box';
---
<div class={cardClass}>
  {icon && (
    <div class={iconClass}>
      <i data-lucide={icon}></i>
    </div>
  )}
  <slot />
</div>
```

- [ ] **Step 5: Write `src/components/elements/Alert.astro`**

```astro
---
interface Props {
  variant: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  title?: string;
  dismissible?: boolean;
}
const { variant, icon, title, dismissible = true } = Astro.props;
---
<div class={`alert alert--${variant}`}>
  <i data-lucide={icon} class="alert__icon"></i>
  <div class="alert__body">
    {title && <p class="alert__title">{title}</p>}
    <p class="alert__text"><slot /></p>
  </div>
  {dismissible && (
    <button class="alert__close" aria-label="Cerrar"><i data-lucide="x"></i></button>
  )}
</div>
```

- [ ] **Step 6: Verify all five render together**

Temporarily add to `src/pages/index.astro` (remove after visually confirming):

```astro
<div style="padding:2rem; display:flex; flex-direction:column; gap:1rem;">
  <Button variant="primary">Comenzar ahora</Button>
  <Badge variant="accent">Nuevo</Badge>
  <Eyebrow>Nuestros servicios</Eyebrow>
  <Card icon="layers"><h3>Diseño modular</h3><p>Texto de prueba.</p></Card>
  <Alert variant="success" icon="check-circle" title="¡Listo!">Los cambios fueron guardados.</Alert>
</div>
```

Run: `pnpm dev`.
Expected: a styled primary button, an accent pill badge, an eyebrow label with decorative line, a card with icon-box + heading + text, and a green success alert with close button — all styled (proves `main.css` classes resolve correctly).

- [ ] **Step 7: Remove the temporary verification block from `src/pages/index.astro`**

- [ ] **Step 8: Commit**

```bash
git add src/components/elements/Button.astro src/components/elements/Badge.astro src/components/elements/Eyebrow.astro src/components/elements/Card.astro src/components/elements/Alert.astro
git commit -m "feat: add Button, Badge, Eyebrow, Card, Alert elements"
```

---

## Task 11: FormField element

**Files:**
- Create: `src/components/elements/FormField.astro`

**Interfaces:**
- Produces: `FormField` with `Props { type?: 'text'|'email'|'tel'|'textarea'|'select'; id: string; name: string; label: string; required?: boolean; options?: string[]; error?: string }`, used by `ContactForm.astro` (Task 20).

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  id: string;
  name: string;
  label: string;
  required?: boolean;
  options?: string[];
  error?: string;
}
const { type = 'text', id, name, label, required = false, options = [], error } = Astro.props;
const groupClass = type === 'select' ? 'form-group form-group--select' : 'form-group';
const controlClass = [
  'form-control',
  type === 'textarea' && 'form-control--textarea',
  type === 'select' && 'form-control--select',
  error && 'error',
]
  .filter(Boolean)
  .join(' ');
---
<div class={groupClass}>
  {type === 'textarea' ? (
    <textarea class={controlClass} id={id} name={name} placeholder=" " required={required}></textarea>
  ) : type === 'select' ? (
    <select class={controlClass} id={id} name={name} required={required}>
      <option value="" disabled selected></option>
      {options.map((opt) => <option value={opt}>{opt}</option>)}
    </select>
  ) : (
    <input type={type} class={controlClass} id={id} name={name} placeholder=" " required={required} />
  )}
  <label for={id}>{label}</label>
  {error && <span class="form-error">{error}</span>}
</div>
```

Save as `src/components/elements/FormField.astro`.

- [ ] **Step 2: Verify rendering**

Temporarily add to `src/pages/index.astro` (remove after confirming):

```astro
<div style="max-width:480px; padding:2rem;">
  <FormField id="test-email" name="email" type="email" label="Correo electrónico" required />
  <FormField id="test-service" name="service" type="select" label="Servicio de interés" options={['Diseño web', 'Desarrollo']} />
</div>
```

Run: `pnpm dev`.
Expected: an email input and a select, both with floating labels that shift up when focused/filled (via `main.css`'s `.form-control:focus + label` / `:not(:placeholder-shown) + label` rules).

- [ ] **Step 3: Remove the temporary verification block**

- [ ] **Step 4: Commit**

```bash
git add src/components/elements/FormField.astro
git commit -m "feat: add FormField element with float-label variants"
```

---

## Task 12: PageLayout, WhatsAppButton, CookieBanner shell

**Files:**
- Create: `src/components/WhatsAppButton.astro`
- Create: `src/components/elements/CookieBanner.astro` (markup only — behavior wired in Task 19)
- Create: `src/layouts/PageLayout.astro`

**Interfaces:**
- Consumes: `Nav`, `SubHero`, `CtaBand`, `Footer`, `ScrollTop`, `BaseLayout` (Tasks 4–9).
- Produces: `PageLayout` with `Props { title: string; description: string; subhero: {eyebrow:string; title:string; breadcrumb:{label:string;href?:string}[]}; cta: {title:string; text:string; ctaPrimary:{label:string;href:string}; ctaSecondary?:{label:string;href:string}; variant?:'accent'|'dark'|'light'} }` and a default `<slot />` — used by all 5 internal pages (Tasks 24–28). `WhatsAppButton` and `CookieBanner` markup, no props for either yet (WhatsApp reads `PUBLIC_WHATSAPP_NUMBER` internally; CookieBanner behavior lands in Task 19).

- [ ] **Step 1: Write `src/components/WhatsAppButton.astro`**

```astro
---
const number = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
---
{number && (
  <a
    href={`https://wa.me/${number}`}
    class="whatsapp-float"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Escríbenos por WhatsApp"
  >
    <i data-lucide="message-circle"></i>
  </a>
)}
```

Save as `src/components/WhatsAppButton.astro`.

- [ ] **Step 2: Write `src/components/elements/CookieBanner.astro`**

```astro
<div class="cookie-banner" id="cookieBanner" hidden>
  <div class="cookie-banner__icon">🍪</div>
  <div class="cookie-banner__content">
    <p class="cookie-banner__title">Usamos cookies</p>
    <p class="cookie-banner__text">
      Utilizamos cookies para mejorar tu experiencia. Consulta nuestra
      <a href="#">Política de privacidad</a> para más información.
    </p>
  </div>
  <div class="cookie-banner__actions">
    <button class="btn btn-outline btn-sm" id="cookieReject">Rechazar</button>
    <button class="btn btn-primary btn-sm" id="cookieAccept">Aceptar todo</button>
  </div>
</div>
```

Save as `src/components/elements/CookieBanner.astro`.

- [ ] **Step 3: Write `src/layouts/PageLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Nav from '../components/sections/Nav.astro';
import SubHero from '../components/sections/SubHero.astro';
import CtaBand from '../components/sections/CtaBand.astro';
import Footer from '../components/sections/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
import ScrollTop from '../components/elements/ScrollTop.astro';
import CookieBanner from '../components/elements/CookieBanner.astro';

interface CtaLink {
  label: string;
  href: string;
}
interface Props {
  title: string;
  description: string;
  subhero: { eyebrow: string; title: string; breadcrumb: { label: string; href?: string }[] };
  cta: {
    title: string;
    text: string;
    ctaPrimary: CtaLink;
    ctaSecondary?: CtaLink;
    variant?: 'accent' | 'dark' | 'light';
  };
}
const { title, description, subhero, cta } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <Nav />
  <SubHero eyebrow={subhero.eyebrow} title={subhero.title} breadcrumb={subhero.breadcrumb} />
  <slot />
  <CtaBand
    title={cta.title}
    text={cta.text}
    ctaPrimary={cta.ctaPrimary}
    ctaSecondary={cta.ctaSecondary}
    variant={cta.variant}
  />
  <Footer />
  <WhatsAppButton />
  <ScrollTop />
  <CookieBanner />
</BaseLayout>
```

Save as `src/layouts/PageLayout.astro`.

- [ ] **Step 4: Verify with a temporary internal-page-style page**

Temporarily create `src/pages/test-layout.astro` (delete after confirming):

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout
  title="Test"
  description="Layout check"
  subhero={{ eyebrow: 'Prueba', title: 'Página de prueba', breadcrumb: [{ label: 'Inicio', href: '/' }, { label: 'Prueba' }] }}
  cta={{ title: '¿Listo?', text: 'Texto de prueba.', ctaPrimary: { label: 'Ir', href: '/' } }}
>
  <div class="container" style="padding-block:4rem;"><p>Contenido de la página.</p></div>
</PageLayout>
```

Run: `pnpm dev`, visit `/test-layout`.
Expected: default (light) nav, dark sub-hero with breadcrumb, page content, accent CTA band, footer, all in order. No WhatsApp button visible (no env var set yet).

- [ ] **Step 5: Delete `src/pages/test-layout.astro`**

- [ ] **Step 6: Commit**

```bash
git add src/components/WhatsAppButton.astro src/components/elements/CookieBanner.astro src/layouts/PageLayout.astro
git commit -m "feat: add PageLayout composing Nav/SubHero/CtaBand/Footer, plus WhatsAppButton and CookieBanner markup"
```

---

## Task 13: Content Collections config + sample content

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/services/diseno-web.md`
- Create: `src/content/services/desarrollo-frontend.md`
- Create: `src/content/services/estrategia-digital.md`
- Create: `src/content/services/automatizaciones-ia.md`
- Create: `src/content/projects/plataforma-saas-b2b.md`
- Create: `src/content/projects/ecommerce-fashion.md`
- Create: `src/content/projects/portal-corporativo.md`
- Create: `src/content/testimonials/maria-lopez.md`
- Create: `src/content/testimonials/carlos-mendoza.md`
- Create: `src/content/testimonials/ana-torres.md`
- Create: `src/content/plans/starter.json`
- Create: `src/content/plans/pro.json`
- Create: `src/content/plans/enterprise.json`

**Interfaces:**
- Produces: `getCollection('services'|'projects'|'testimonials'|'plans')` — consumed by `ServicesGrid.astro` (Task 14), `ProjectsGrid.astro` (Task 15), `Plans.astro` (Task 16), `Testimonials.astro` (Task 17).

- [ ] **Step 1: Write `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    icon: z.string(),
    excerpt: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    image: z.string(),
    year: z.number(),
    order: z.number().default(0),
  }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    quote: z.string(),
    avatar: z.string().optional(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

const plans = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    price: z.string(),
    period: z.enum(['month', 'year', 'one-time', 'custom']),
    features: z.array(z.string()),
    highlighted: z.boolean().default(false),
  }),
});

export const collections = { services, projects, testimonials, plans };
```

- [ ] **Step 2: Write the 4 service entries**

`src/content/services/diseno-web.md`:
```md
---
title: Diseño web
icon: layout-dashboard
excerpt: Creamos interfaces atractivas y funcionales centradas en la experiencia del usuario y la conversión.
featured: true
order: 1
---
```

`src/content/services/desarrollo-frontend.md`:
```md
---
title: Desarrollo frontend
icon: code-2
excerpt: Código limpio, semántico y optimizado. Sitios que cargan rápido y convierten mejor.
featured: true
order: 2
---
```

`src/content/services/estrategia-digital.md`:
```md
---
title: Estrategia digital
icon: bar-chart-2
excerpt: Definimos el camino más eficiente para que tu negocio crezca de forma sostenible en el entorno digital.
featured: true
order: 3
---
```

`src/content/services/automatizaciones-ia.md`:
```md
---
title: Automatizaciones IA
icon: zap
excerpt: Integramos flujos automatizados e inteligencia artificial para reducir trabajo manual y acelerar procesos.
featured: false
order: 4
---
```

- [ ] **Step 3: Write the 3 project entries**

`src/content/projects/plataforma-saas-b2b.md`:
```md
---
title: Plataforma SaaS B2B
tags: ['Diseño web', 'Desarrollo']
image: https://picsum.photos/seed/proj1/800/500
year: 2024
order: 1
---
```

`src/content/projects/ecommerce-fashion.md`:
```md
---
title: E-commerce Fashion
tags: ['Branding', 'Frontend']
image: https://picsum.photos/seed/proj2/800/500
year: 2024
order: 2
---
```

`src/content/projects/portal-corporativo.md`:
```md
---
title: Portal corporativo
tags: ['SaaS B2B', 'Dashboard']
image: https://picsum.photos/seed/cover-gl2/800/500
year: 2024
order: 3
---
```

- [ ] **Step 4: Write the 3 testimonial entries**

`src/content/testimonials/maria-lopez.md`:
```md
---
name: María López
role: CEO
company: Fintech Lima
quote: El equipo entendió nuestra visión desde el primer día. El resultado superó todas nuestras expectativas de conversión.
avatar: https://picsum.photos/seed/av1/80/80
rating: 5
---
```

`src/content/testimonials/carlos-mendoza.md`:
```md
---
name: Carlos Mendoza
role: CTO
company: SaaS B2B
quote: Proceso ágil, comunicación impecable y entrega a tiempo. Lo recomendaría sin dudarlo a cualquier empresa.
avatar: https://picsum.photos/seed/av2/80/80
rating: 5
---
```

`src/content/testimonials/ana-torres.md`:
```md
---
name: Ana Torres
role: Directora
company: Consultora HR
quote: Rediseñaron nuestra web en 4 semanas. Las métricas mejoraron notablemente desde el lanzamiento.
avatar: https://picsum.photos/seed/av3/80/80
rating: 5
---
```

- [ ] **Step 5: Write the 3 plan entries**

`src/content/plans/starter.json`:
```json
{
  "name": "Starter",
  "price": "$490",
  "period": "one-time",
  "features": ["Hasta 5 páginas", "Diseño responsive", "SEO básico", "2 rondas de revisión"],
  "highlighted": false
}
```

`src/content/plans/pro.json`:
```json
{
  "name": "Pro",
  "price": "$990",
  "period": "one-time",
  "features": ["Hasta 12 páginas", "Diseño a medida", "CMS integrado", "SEO avanzado", "Revisiones ilimitadas"],
  "highlighted": true
}
```

`src/content/plans/enterprise.json`:
```json
{
  "name": "Enterprise",
  "price": "Custom",
  "period": "custom",
  "features": ["Páginas ilimitadas", "Integraciones API", "Soporte prioritario", "SLA garantizado"],
  "highlighted": false
}
```

- [ ] **Step 6: Verify the collections type-check and build**

Run: `pnpm check`
Expected: no errors about `src/content/config.ts` or content frontmatter.

Run: `pnpm build`
Expected: `Complete!` (collections load without schema violations).

- [ ] **Step 7: Commit**

```bash
git add src/content/
git commit -m "feat: add content collections (services, projects, testimonials, plans) with sample Genesys content"
```

---

## Task 14: ServiceCard + ServicesGrid

**Files:**
- Create: `src/components/sections/ServiceCard.astro`
- Create: `src/components/sections/ServicesGrid.astro`

**Interfaces:**
- Consumes: `services` collection (Task 13).
- Produces: `ServicesGrid` with `Props { featuredOnly?: boolean }`, used by `index.astro` (Task 23, `featuredOnly`) and `services.astro` (Task 25, full catalog).

- [ ] **Step 1: Write `src/components/sections/ServiceCard.astro`**

```astro
---
interface Props {
  title: string;
  icon: string;
  excerpt: string;
  href?: string;
}
const { title, icon, excerpt, href = '/services' } = Astro.props;
---
<div class="service-card">
  <div class="icon-box"><i data-lucide={icon}></i></div>
  <h3 class="service-card__title">{title}</h3>
  <p class="service-card__text">{excerpt}</p>
  <a href={href} class="service-card__link">
    Ver servicio <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
  </a>
</div>
```

- [ ] **Step 2: Write `src/components/sections/ServicesGrid.astro`**

```astro
---
import { getCollection } from 'astro:content';
import ServiceCard from './ServiceCard.astro';

interface Props {
  featuredOnly?: boolean;
}
const { featuredOnly = false } = Astro.props;
const allServices = await getCollection('services');
const services = (featuredOnly ? allServices.filter((s) => s.data.featured) : allServices).sort(
  (a, b) => a.data.order - b.data.order
);
---
<div class="services-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-5);">
  {services.map((service) => (
    <ServiceCard title={service.data.title} icon={service.data.icon} excerpt={service.data.excerpt} />
  ))}
</div>
```

- [ ] **Step 3: Verify in the browser**

Temporarily add `<ServicesGrid featuredOnly />` to `src/pages/index.astro` (remove after confirming).

Run: `pnpm dev`.
Expected: a 3-column grid of the 3 featured services (Diseño web, Desarrollo frontend, Estrategia digital) — Automatizaciones IA (not featured) is excluded.

- [ ] **Step 4: Remove the temporary block**

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ServiceCard.astro src/components/sections/ServicesGrid.astro
git commit -m "feat: add ServiceCard and ServicesGrid reading the services collection"
```

---

## Task 15: ProjectCard + ProjectsGrid

**Files:**
- Create: `src/components/sections/ProjectCard.astro`
- Create: `src/components/sections/ProjectsGrid.astro`

**Interfaces:**
- Consumes: `projects` collection (Task 13).
- Produces: `ProjectsGrid` with `Props { limit?: number }`, used by `index.astro` (Task 23, `limit={2}`) and `projects.astro` (Task 26, full gallery).

- [ ] **Step 1: Write `src/components/sections/ProjectCard.astro`**

```astro
---
interface Props {
  title: string;
  image: string;
  tag: string;
  num: string;
}
const { title, image, tag, num } = Astro.props;
---
<div class="project-card">
  <img class="project-card__img" src={image} alt={title} loading="lazy" />
  <div class="project-card__overlay">
    <span class="project-card__num">{num}</span>
    <h3 class="project-card__title">{title}</h3>
    <span class="project-card__tag">{tag}</span>
  </div>
</div>
```

- [ ] **Step 2: Write `src/components/sections/ProjectsGrid.astro`**

```astro
---
import { getCollection } from 'astro:content';
import ProjectCard from './ProjectCard.astro';

interface Props {
  limit?: number;
}
const { limit } = Astro.props;
const allProjects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
const projects = limit ? allProjects.slice(0, limit) : allProjects;
---
<div class="projects__grid">
  {projects.map((project, i) => (
    <ProjectCard
      title={project.data.title}
      image={project.data.image}
      tag={project.data.tags.join(' · ')}
      num={`${String(i + 1).padStart(2, '0')} · ${project.data.year}`}
    />
  ))}
</div>
```

- [ ] **Step 3: Verify in the browser**

Temporarily add `<ProjectsGrid limit={2} />` to `src/pages/index.astro` (remove after confirming).

Run: `pnpm dev`.
Expected: a 2-column grid showing "Plataforma SaaS B2B" and "E-commerce Fashion" only, each with a zoom-on-hover image, project number/year, title, and tag overlay.

- [ ] **Step 4: Remove the temporary block**

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ProjectCard.astro src/components/sections/ProjectsGrid.astro
git commit -m "feat: add ProjectCard and ProjectsGrid reading the projects collection"
```

---

## Task 16: Plans component

**Files:**
- Create: `src/components/sections/Plans.astro`

**Interfaces:**
- Consumes: `plans` collection (Task 13).
- Produces: `Plans` Astro component, no props, used by `index.astro` (Task 23).

- [ ] **Step 1: Write the component**

```astro
---
import { getCollection } from 'astro:content';
const plans = await getCollection('plans');

function periodLabel(period: string): string {
  if (period === 'month') return 'por mes';
  if (period === 'year') return 'por año';
  if (period === 'custom') return 'cotización a medida';
  return 'pago único';
}
---
<div class="plans-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-5); align-items:start;">
  {plans.map((plan) => (
    <div class={plan.data.highlighted ? 'plan-card plan-card--featured' : 'plan-card'}>
      {plan.data.highlighted && <div class="plan-card__badge">Más popular</div>}
      <div class="plan-card__name">{plan.data.name}</div>
      <div class="plan-card__price">{plan.data.price}</div>
      <div class="plan-card__period">{periodLabel(plan.data.period)}</div>
      <div class="plan-card__divider"></div>
      <div class="plan-card__features">
        {plan.data.features.map((feature) => (
          <div class="plan-card__feature">
            <i data-lucide="check" class="plan-card__feature-icon"></i> {feature}
          </div>
        ))}
      </div>
      <a
        href="/contact-us"
        class={plan.data.highlighted ? 'btn' : 'btn btn-outline'}
        style={plan.data.highlighted
          ? 'width:100%; justify-content:center; background:#fff; color:var(--color-accent); font-weight:700;'
          : 'width:100%; justify-content:center;'}
      >
        {plan.data.highlighted ? 'Empezar' : 'Contactar'}
      </a>
    </div>
  ))}
</div>
```

Save as `src/components/sections/Plans.astro`.

- [ ] **Step 2: Verify in the browser**

Temporarily add `<Plans />` to `src/pages/index.astro` (remove after confirming).

Run: `pnpm dev`.
Expected: 3 plan cards (Starter $490, Pro $990 featured with "Más popular" badge and accent background, Enterprise Custom), each listing its features with check icons.

- [ ] **Step 3: Remove the temporary block**

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Plans.astro
git commit -m "feat: add Plans component reading the plans collection"
```

---

## Task 17: Testimonials + ClientLogos components

**Files:**
- Create: `src/components/sections/Testimonials.astro`
- Create: `src/components/sections/ClientLogos.astro`

**Interfaces:**
- Consumes: `testimonials` collection (Task 13).
- Produces: `Testimonials` with `Props { variant?: 'dark'|'light' }`, used by `index.astro`/`clients.astro`. `ClientLogos`, no props, used by `index.astro`.

- [ ] **Step 1: Write `src/components/sections/Testimonials.astro`**

```astro
---
import { getCollection } from 'astro:content';

interface Props {
  variant?: 'dark' | 'light';
}
const { variant = 'dark' } = Astro.props;
const testimonials = await getCollection('testimonials');
---
<div class="testimonials-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-5); align-items:start;">
  {testimonials.map((t) => (
    <div class={variant === 'light' ? 'testimonial-card testimonial-card--light' : 'testimonial-card'}>
      <div class="testimonial-card__stars">
        {Array.from({ length: t.data.rating }).map(() => (
          <i data-lucide="star" style="width:18px;height:18px;fill:currentColor;"></i>
        ))}
      </div>
      <p class="testimonial-card__quote">"{t.data.quote}"</p>
      <div class="testimonial-card__author">
        {t.data.avatar && <img class="testimonial-card__avatar" src={t.data.avatar} alt={t.data.name} />}
        <div>
          <div class="testimonial-card__name">{t.data.name}</div>
          <div class="testimonial-card__role">{t.data.role} · {t.data.company}</div>
        </div>
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Write `src/components/sections/ClientLogos.astro`**

```astro
---
const logos = ['TechCorp', 'Innolab', 'Nexus', 'Stratify', 'Velox', 'Orbita'];
---
<div>
  <p class="logos-section__label">Empresas que confían en nosotros</p>
  <div class="logos-grid">
    {logos.map((logo) => (
      <div class="logo-item"><div class="logo-placeholder">{logo}</div></div>
    ))}
  </div>
</div>
```

- [ ] **Step 3: Verify in the browser**

Temporarily add `<Testimonials />` and `<ClientLogos />` to `src/pages/index.astro` (remove after confirming).

Run: `pnpm dev`.
Expected: 3-column testimonial cards with 5 filled stars each, quote, avatar, name/role; below it, a row of 6 grayscale logo placeholders that turn accent-colored on hover.

- [ ] **Step 4: Remove the temporary block**

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Testimonials.astro src/components/sections/ClientLogos.astro
git commit -m "feat: add Testimonials and ClientLogos components"
```

---

## Task 18: ProcessSteps + ContactStrip components

**Files:**
- Create: `src/components/sections/ProcessSteps.astro`
- Create: `src/components/sections/ContactStrip.astro`

**Interfaces:**
- Produces: `ProcessSteps`, no props (static 4-step content), used by `about-us.astro` (Task 24). `ContactStrip` with `Props { variant?: 'light'|'ondark' }`, used by `contact-us.astro` (Task 28).

- [ ] **Step 1: Write `src/components/sections/ProcessSteps.astro`**

```astro
---
interface Step {
  num: string;
  icon: string;
  title: string;
  text: string;
}
const steps: Step[] = [
  { num: '01', icon: 'file-text', title: 'Brief', text: 'Entendemos tus objetivos, audiencia y diferenciadores del negocio.' },
  { num: '02', icon: 'pen-tool', title: 'Diseño', text: 'Wireframes, prototipo y propuesta visual con tu identidad de marca.' },
  { num: '03', icon: 'code-2', title: 'Desarrollo', text: 'Código limpio, accesible y optimizado para velocidad y SEO.' },
  { num: '04', icon: 'rocket', title: 'Lanzamiento', text: 'Deploy, QA final y capacitación para que gestiones el sitio.' },
];
---
<div class="process-grid" style="grid-template-columns:repeat(4,1fr);">
  {steps.map((step) => (
    <div class="process-card">
      <span class="process-card__num">{step.num}</span>
      <div class="process-card__icon"><div class="icon-box icon-box--sm"><i data-lucide={step.icon}></i></div></div>
      <h3 class="process-card__title">{step.title}</h3>
      <p class="process-card__text">{step.text}</p>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Write `src/components/sections/ContactStrip.astro`**

```astro
---
interface Props {
  variant?: 'light' | 'ondark';
}
const { variant = 'light' } = Astro.props;
const items = [
  { icon: 'mail', label: 'Correo', value: 'hola@genesys.io', href: 'mailto:hola@genesys.io' },
  { icon: 'phone', label: 'Teléfono', value: '+51 1 234 5678', href: 'tel:+5112345678' },
  { icon: 'map-pin', label: 'Ubicación', value: 'Lima, Perú' },
];
---
<div class={variant === 'ondark' ? 'contact-strip contact-strip--ondark' : 'contact-strip'}>
  {items.map((item) => (
    <div class="contact-strip__item">
      <div class="icon-box icon-box--sm"><i data-lucide={item.icon}></i></div>
      <div>
        <div class="contact-strip__label">{item.label}</div>
        {item.href ? (
          <a href={item.href} class="contact-strip__value">{item.value}</a>
        ) : (
          <span class="contact-strip__value">{item.value}</span>
        )}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 3: Verify in the browser**

Temporarily add both to `src/pages/index.astro` (remove after confirming).

Run: `pnpm dev`.
Expected: a 4-card process grid (Brief → Diseño → Desarrollo → Lanzamiento) with ghost numbers, and a 3-item contact strip (Correo/Teléfono/Ubicación) with icon boxes.

- [ ] **Step 4: Remove the temporary block**

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ProcessSteps.astro src/components/sections/ContactStrip.astro
git commit -m "feat: add ProcessSteps and ContactStrip components"
```

---

## Task 19: Pure logic module — cookie consent, plus CookieBanner behavior

**Files:**
- Create: `src/lib/cookie-consent.ts`
- Test: `src/lib/cookie-consent.test.ts`
- Create: `src/scripts/cookie-banner.ts`
- Modify: `src/components/elements/CookieBanner.astro` (Task 12) — add the `<script>` tag

**Interfaces:**
- Produces: `type CookieConsent = 'accepted' | 'rejected'`, `getStoredConsent(storage: Pick<Storage,'getItem'>): CookieConsent | null`, `storeConsent(storage: Pick<Storage,'setItem'>, consent: CookieConsent): void`.

- [ ] **Step 1: Write the failing test**

```ts
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
```

Save as `src/lib/cookie-consent.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/cookie-consent.test.ts`
Expected: FAIL — `Cannot find module './cookie-consent'`.

- [ ] **Step 3: Write minimal implementation**

```ts
const STORAGE_KEY = 'genesys-cookie-consent';

export type CookieConsent = 'accepted' | 'rejected';

export function getStoredConsent(storage: Pick<Storage, 'getItem'>): CookieConsent | null {
  const value = storage.getItem(STORAGE_KEY);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function storeConsent(storage: Pick<Storage, 'setItem'>, consent: CookieConsent): void {
  storage.setItem(STORAGE_KEY, consent);
}
```

Save as `src/lib/cookie-consent.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/cookie-consent.test.ts`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Write `src/scripts/cookie-banner.ts`**

```ts
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
```

- [ ] **Step 6: Add the script tag to `src/components/elements/CookieBanner.astro`**

Append to the end of the file:

```astro
<script>
  import { initCookieBanner } from '../../scripts/cookie-banner';
  initCookieBanner();
</script>
```

- [ ] **Step 7: Verify in the browser**

Run: `pnpm dev`, open the site in a private/incognito window (clean localStorage).
Expected: the cookie banner appears. Clicking "Aceptar todo" hides it. Reloading the page keeps it hidden (check `localStorage.getItem('genesys-cookie-consent')` in devtools → `"accepted"`). Clear localStorage and reload — the banner reappears.

- [ ] **Step 8: Commit**

```bash
git add src/lib/cookie-consent.ts src/lib/cookie-consent.test.ts src/scripts/cookie-banner.ts src/components/elements/CookieBanner.astro
git commit -m "feat: add cookie consent storage logic and wire CookieBanner behavior"
```

---

## Task 20: Pure logic module — form validation, plus Newsletter and ContactForm

**Files:**
- Create: `src/lib/form-validation.ts`
- Test: `src/lib/form-validation.test.ts`
- Create: `src/scripts/newsletter-form.ts`
- Create: `src/scripts/contact-form.ts`
- Create: `src/components/sections/Newsletter.astro`
- Create: `src/components/sections/ContactForm.astro`

**Interfaces:**
- Produces: `isValidEmail(value: string): boolean`, `interface ContactFormValues { name:string; email:string; company:string; phone:string; service:string; message:string }`, `validateContactForm(values: ContactFormValues): Partial<Record<keyof ContactFormValues,string>>`. Consumed by `newsletter-form.ts` and `contact-form.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isValidEmail, validateContactForm, type ContactFormValues } from './form-validation';

const validValues: ContactFormValues = {
  name: 'Juan García',
  email: 'juan@empresa.com',
  company: 'Empresa SAC',
  phone: '',
  service: 'Diseño web',
  message: 'Quisiera cotizar un rediseño completo de nuestro sitio.',
};

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('juan@empresa.com')).toBe(true);
  });

  it('rejects a string without an @', () => {
    expect(isValidEmail('no-es-email')).toBe(false);
  });

  it('rejects an email without a domain suffix', () => {
    expect(isValidEmail('juan@empresa')).toBe(false);
  });
});

describe('validateContactForm', () => {
  it('returns no errors for fully valid values', () => {
    expect(validateContactForm(validValues)).toEqual({});
  });

  it('requires a name of at least 2 characters', () => {
    const errors = validateContactForm({ ...validValues, name: 'J' });
    expect(errors.name).toBeDefined();
  });

  it('requires a valid email', () => {
    const errors = validateContactForm({ ...validValues, email: 'no-es-email' });
    expect(errors.email).toBeDefined();
  });

  it('requires a company name', () => {
    const errors = validateContactForm({ ...validValues, company: '' });
    expect(errors.company).toBeDefined();
  });

  it('allows an empty phone (optional field)', () => {
    const errors = validateContactForm({ ...validValues, phone: '' });
    expect(errors.phone).toBeUndefined();
  });

  it('rejects a phone with fewer than 7 digits when provided', () => {
    const errors = validateContactForm({ ...validValues, phone: '12345' });
    expect(errors.phone).toBeDefined();
  });

  it('requires a service selection', () => {
    const errors = validateContactForm({ ...validValues, service: '' });
    expect(errors.service).toBeDefined();
  });

  it('requires a message of at least 10 characters', () => {
    const errors = validateContactForm({ ...validValues, message: 'corto' });
    expect(errors.message).toBeDefined();
  });
});
```

Save as `src/lib/form-validation.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/form-validation.test.ts`
Expected: FAIL — `Cannot find module './form-validation'`.

- [ ] **Step 3: Write minimal implementation**

```ts
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
```

Save as `src/lib/form-validation.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/form-validation.test.ts`
Expected: PASS — 11 tests passed.

- [ ] **Step 5: Write `src/scripts/newsletter-form.ts`**

```ts
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
```

- [ ] **Step 6: Write `src/scripts/contact-form.ts`**

```ts
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
```

- [ ] **Step 7: Write `src/components/sections/Newsletter.astro`**

```astro
<div class="newsletter">
  <div class="newsletter__inner">
    <h2 class="newsletter__title">Recibe insights de diseño digital</h2>
    <p class="newsletter__text">Recursos, tendencias y casos de estudio cada dos semanas. Sin spam, solo valor.</p>
    <form class="newsletter__form" id="newsletterForm">
      <input type="email" class="newsletter__input" name="email" placeholder="tu@email.com" aria-label="Correo electrónico" required />
      <button type="submit" class="btn btn-primary">Suscribirme</button>
    </form>
    <div class="newsletter__success" id="newsletterSuccess">
      <i data-lucide="check-circle"></i>
      ¡Suscripción confirmada! Revisa tu bandeja de entrada.
    </div>
  </div>
</div>
<script>
  import { initNewsletterForm } from '../../scripts/newsletter-form';
  initNewsletterForm();
</script>
```

- [ ] **Step 8: Write `src/components/sections/ContactForm.astro`**

```astro
---
import FormField from '../elements/FormField.astro';
---
<form id="contactForm" novalidate>
  <div class="row g-4">
    <div class="col-md-6">
      <FormField id="c-name" name="name" label="Nombre completo" required />
    </div>
    <div class="col-md-6">
      <FormField id="c-email" name="email" type="email" label="Correo electrónico" required />
    </div>
    <div class="col-md-6">
      <FormField id="c-company" name="company" label="Empresa" required />
    </div>
    <div class="col-md-6">
      <FormField id="c-phone" name="phone" type="tel" label="Teléfono (opcional)" />
    </div>
    <div class="col-12">
      <FormField
        id="c-service"
        name="service"
        type="select"
        label="Servicio de interés"
        required
        options={['Diseño web', 'Desarrollo frontend', 'Estrategia digital', 'Automatizaciones IA']}
      />
    </div>
    <div class="col-12">
      <FormField id="c-msg" name="message" type="textarea" label="Mensaje" required />
    </div>
  </div>
  <button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--space-6);">
    <span class="btn__text">Enviar mensaje</span>
  </button>
  <div class="form-success" id="contactSuccess">
    <i data-lucide="check-circle"></i>
    ¡Mensaje enviado con éxito! Te contactaremos en menos de 24 horas.
  </div>
</form>
<script>
  import { initContactForm } from '../../scripts/contact-form';
  initContactForm();
</script>
```

- [ ] **Step 9: Verify both forms in the browser**

Temporarily add `<Newsletter />` and `<ContactForm />` to `src/pages/index.astro` (remove after confirming).

Run: `pnpm dev`.
For the newsletter: submit an empty/invalid email → input gets `.error` outline; submit `test@example.com` → form hides, success message shows.
For the contact form: submit empty → every required field shows its exact error message below it (matching the messages in `form-validation.ts`) and no page navigation occurs; fill all fields validly → form hides, success message shows. Confirm in the Network tab that **no request** is sent on submit.

- [ ] **Step 10: Remove the temporary block**

- [ ] **Step 11: Commit**

```bash
git add src/lib/form-validation.ts src/lib/form-validation.test.ts src/scripts/newsletter-form.ts src/scripts/contact-form.ts src/components/sections/Newsletter.astro src/components/sections/ContactForm.astro
git commit -m "feat: add form validation logic, Newsletter and ContactForm (front-end only, no real submission)"
```

---

## Task 21: Pure logic module — counters, plus StatsCounter

**Files:**
- Create: `src/lib/counters.ts`
- Test: `src/lib/counters.test.ts`
- Create: `src/scripts/counters.ts`
- Create: `src/components/sections/StatsCounter.astro`

**Interfaces:**
- Produces: `counterStep(target:number, durationMs:number, frameMs:number): number`, `nextCounterValue(current:number, target:number, step:number): number`, `formatCounterValue(value:number, suffix:string): string`. Used by `index.astro` (Task 23) and `about-us.astro` (Task 24).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { counterStep, nextCounterValue, formatCounterValue } from './counters';

describe('counterStep', () => {
  it('divides the target across the number of frames', () => {
    // 1200ms / 16ms per frame = 75 frames → 120 / 75 = 1.6 per frame
    expect(counterStep(120, 1200, 16)).toBeCloseTo(1.6);
  });

  it('never returns fewer than 1 frame worth of step', () => {
    expect(counterStep(10, 0, 16)).toBe(10);
  });
});

describe('nextCounterValue', () => {
  it('advances by the step', () => {
    expect(nextCounterValue(0, 120, 1.6)).toBeCloseTo(1.6);
  });

  it('caps at the target instead of overshooting', () => {
    expect(nextCounterValue(119, 120, 1.6)).toBe(120);
  });

  it('stays at the target once reached', () => {
    expect(nextCounterValue(120, 120, 1.6)).toBe(120);
  });
});

describe('formatCounterValue', () => {
  it('rounds to the nearest integer and appends the suffix', () => {
    expect(formatCounterValue(98.6, '%')).toBe('99%');
  });

  it('supports an empty suffix', () => {
    expect(formatCounterValue(8, '')).toBe('8');
  });
});
```

Save as `src/lib/counters.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/counters.test.ts`
Expected: FAIL — `Cannot find module './counters'`.

- [ ] **Step 3: Write minimal implementation**

```ts
export function counterStep(target: number, durationMs: number, frameMs: number): number {
  const frames = Math.max(1, Math.round(durationMs / frameMs));
  return target / frames;
}

export function nextCounterValue(current: number, target: number, step: number): number {
  const next = current + step;
  return next >= target ? target : next;
}

export function formatCounterValue(value: number, suffix: string): string {
  return `${Math.round(value)}${suffix}`;
}
```

Save as `src/lib/counters.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/counters.test.ts`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Write `src/scripts/counters.ts`**

```ts
import { counterStep, nextCounterValue, formatCounterValue } from '../lib/counters';

const DURATION_MS = 1200;
const FRAME_MS = 16;

function animate(el: HTMLElement): void {
  const target = Number(el.dataset.counter);
  const suffix = el.dataset.suffix ?? '';
  if (Number.isNaN(target)) return;

  const step = counterStep(target, DURATION_MS, FRAME_MS);
  let current = 0;

  function tick(): void {
    current = nextCounterValue(current, target, step);
    el.textContent = formatCounterValue(current, suffix);
    if (current < target) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function initCounters(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-counter]');
  if (items.length === 0) return;

  if (!window.IntersectionObserver) {
    items.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  items.forEach((item) => observer.observe(item));
}
```

- [ ] **Step 6: Write `src/components/sections/StatsCounter.astro`**

```astro
---
interface StatItem {
  value: number;
  suffix?: string;
  label: string;
  sub?: string;
}
interface Props {
  items: StatItem[];
  variant?: 'default' | 'dark';
}
const { items, variant = 'default' } = Astro.props;
const gridClass = variant === 'dark' ? 'stats-grid stats-grid--dark' : 'stats-grid';
---
<div class={gridClass}>
  {items.map((item) => (
    <div class="stat-item">
      <div class="stat-item__value" data-counter={item.value} data-suffix={item.suffix ?? ''}>
        0{item.suffix ?? ''}
      </div>
      <div class="stat-item__label">{item.label}</div>
      {item.sub && <div class="stat-item__sub">{item.sub}</div>}
    </div>
  ))}
</div>
<script>
  import { initCounters } from '../../scripts/counters';
  initCounters();
</script>
```

- [ ] **Step 7: Verify in the browser**

Temporarily add to `src/pages/index.astro`:

```astro
<StatsCounter
  items={[
    { value: 120, suffix: '+', label: 'Proyectos entregados', sub: 'En 8 países' },
    { value: 8, label: 'Años de experiencia', sub: 'Desde 2016' },
    { value: 98, suffix: '%', label: 'Satisfacción del cliente', sub: 'NPS · 2024' },
  ]}
/>
```

Run: `pnpm dev`. Scroll the stats grid into view.
Expected: each number animates from 0 up to its target (120+, 8, 98%) over about 1.2 seconds once the element enters the viewport, and does not re-animate on subsequent scrolls past it.

- [ ] **Step 8: Remove the temporary block**

- [ ] **Step 9: Commit**

```bash
git add src/lib/counters.ts src/lib/counters.test.ts src/scripts/counters.ts src/components/sections/StatsCounter.astro
git commit -m "feat: add tested counter stepping logic and StatsCounter component"
```

---

## Task 22: Section Swiper and WOW.js scroll-reveal wiring

**Files:**
- Create: `src/scripts/section-swipers.ts`
- Create: `src/scripts/scroll-reveal.ts`

**Interfaces:**
- Produces: `initSectionSwipers(): void` and `initScrollReveal(): void`, both called from `index.astro` (Task 23) and `about-us.astro` (Task 24), which use `class="wow animate__fadeInUp"` on section headers.

- [ ] **Step 1: Write `src/scripts/section-swipers.ts`**

```ts
export function initSectionSwipers(): void {
  if (!window.Swiper) return;

  const services = document.querySelector<HTMLElement>('.services-swiper');
  if (services) {
    new window.Swiper(services, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      pagination: { el: services.querySelector('.swiper-pagination'), clickable: true },
      breakpoints: { 640: { slidesPerView: 2 }, 992: { slidesPerView: 3 } },
    });
  }
}
```

- [ ] **Step 2: Write `src/scripts/scroll-reveal.ts`**

Ports `initWow()` from the original UI-kit's `main.js`: initializes WOW.js against every `.wow` element, then re-syncs after images load and sweeps any element that entered the viewport but never got revealed (WOW.js occasionally misses fast scrolls or anchor jumps).

```ts
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
```

Save as `src/scripts/scroll-reveal.ts`.

- [ ] **Step 3: Add the `WOW` global type**

Confirm `src/env.d.ts` (Task 1) already declares `WOW?: new (options?: Record<string, unknown>) => { init: () => void; sync: () => void }` on `Window` — it does, no change needed here.

- [ ] **Step 4: Verify manually once wired into `index.astro` and `about-us.astro` in Tasks 23–24**

(No standalone verification here — neither module has pure logic to unit test; both are thin wrappers around vendored libraries, verified end-to-end in the browser checks of Tasks 23 and 24.)

- [ ] **Step 5: Commit**

```bash
git add src/scripts/section-swipers.ts src/scripts/scroll-reveal.ts
git commit -m "feat: add section Swiper init and WOW.js scroll-reveal wiring"
```

---

## Task 23: index.astro — assemble the homepage

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder from Tasks 1/4/8 with the final page)

**Interfaces:**
- Consumes: `BaseLayout`, `Nav`, `Hero`, `Card`, `StatsCounter`, `ServicesGrid`, `ProjectsGrid`, `Plans`, `Newsletter`, `Testimonials`, `ClientLogos`, `CtaBand`, `Footer`, `WhatsAppButton`, `ScrollTop`, `CookieBanner`, and `initSectionSwipers` + `initScrollReveal` from Task 22.

- [ ] **Step 1: Write the full homepage**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/sections/Nav.astro';
import Hero from '../components/sections/Hero.astro';
import Card from '../components/elements/Card.astro';
import StatsCounter from '../components/sections/StatsCounter.astro';
import ServiceCard from '../components/sections/ServiceCard.astro';
import ProjectsGrid from '../components/sections/ProjectsGrid.astro';
import Plans from '../components/sections/Plans.astro';
import Newsletter from '../components/sections/Newsletter.astro';
import Testimonials from '../components/sections/Testimonials.astro';
import ClientLogos from '../components/sections/ClientLogos.astro';
import CtaBand from '../components/sections/CtaBand.astro';
import Footer from '../components/sections/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
import ScrollTop from '../components/elements/ScrollTop.astro';
import CookieBanner from '../components/elements/CookieBanner.astro';
import { getCollection } from 'astro:content';

const services = (await getCollection('services'))
  .filter((s) => s.data.featured)
  .sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout
  title="Genesys | Starter Theme"
  description="Soluciones tecnológicas y servicios digitales para empresas que buscan crecer en el mundo digital."
>
  <Nav variant="over-hero" />

  <Hero
    eyebrowText="Tecnología · Estrategia · Resultados"
    sub="Somos un equipo de ingenieros, diseñadores y estrategas obsesionados con crear productos digitales que generan impacto real. Sin humo, sin atajos."
    bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80&auto=format&fit=crop"
    ctaPrimary={{ label: 'Conoce nuestra historia', href: '#about' }}
    ctaSecondary={{ label: 'Ver proyectos', href: '/projects' }}
    note="Más de 120 proyectos entregados en 8 países"
  >
    <Fragment slot="title">
      <span class="hero__line"><span>Construimos el</span></span>
      <span class="hero__line"><span>futuro digital de <span class="accent">tu empresa</span></span></span>
      <span class="hero__line"><span>desde hoy.</span></span>
    </Fragment>
  </Hero>

  <!-- About Us -->
  <section class="section" id="about" aria-labelledby="about-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow">Quiénes somos</span>
        <h2 class="section-title" id="about-title">
          No somos una agencia más.<br />Somos tu <span class="accent">equipo de producto</span>.
        </h2>
        <p class="section-lead">
          Fundada en 2016, Genesys nació de una idea simple: las empresas merecen tecnología de nivel
          enterprise sin los precios astronómicos ni la burocracia de las grandes consultoras.
        </p>
      </div>

      <div class="row align-items-center g-5 mb-5">
        <div class="col-lg-6" style="display:flex; flex-direction:column; gap:var(--space-6);">
          <Card icon="target"><h3>Enfoque en resultados</h3><p>Cada línea de código, cada decisión de diseño responde a un objetivo de negocio concreto.</p></Card>
          <Card icon="users"><h3>Equipo integrado</h3><p>Diseñadores, ingenieros y estrategas trabajando en un solo flujo, sin silos.</p></Card>
          <Card icon="zap"><h3>Velocidad sin caos</h3><p>Metodología ágil real: entregas cada dos semanas, feedback continuo.</p></Card>
        </div>
        <div class="col-lg-6">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
            alt="Equipo de Genesys trabajando en oficina moderna"
            style="width:100%; border-radius:var(--radius-card); object-fit:cover; aspect-ratio:4/3;"
            loading="lazy"
          />
        </div>
      </div>

      <StatsCounter
        items={[
          { value: 120, suffix: '+', label: 'Proyectos entregados', sub: 'En 8 países' },
          { value: 8, label: 'Años de experiencia', sub: 'Desde 2016' },
          { value: 40, suffix: '+', label: 'Clientes activos', sub: 'B2B & enterprise' },
          { value: 98, suffix: '%', label: 'Satisfacción del cliente', sub: 'NPS · 2024' },
        ]}
      />
    </div>
  </section>

  <!-- Our Services (carousel) -->
  <section class="section" aria-labelledby="services-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow">Nuestros servicios</span>
        <h2 class="section-title" id="services-title">Todo lo que tu negocio necesita para crecer</h2>
      </div>
      <div class="swiper services-swiper">
        <div class="swiper-wrapper">
          {services.map((service) => (
            <div class="swiper-slide">
              <ServiceCard title={service.data.title} icon={service.data.icon} excerpt={service.data.excerpt} />
            </div>
          ))}
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </div>
  </section>

  <!-- Why Choose Us -->
  <section class="section" style="background:var(--color-primary); color:#fff;" aria-labelledby="why-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow eyebrow--inverse">Por qué elegirnos</span>
        <h2 class="section-title" style="color:#fff;" id="why-title">Resultados, no solo entregables</h2>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <Card variant="glass" icon="trending-up" iconOnDark><h3>Crecimiento medible</h3><p>Métricas claras que demuestran el impacto de cada acción.</p></Card>
        </div>
        <div class="col-md-4">
          <Card variant="glass" icon="shield" iconOnDark><h3>Seguridad enterprise</h3><p>Protocolos de nivel bancario para todos los proyectos.</p></Card>
        </div>
        <div class="col-md-4">
          <Card variant="glass" icon="rocket" iconOnDark><h3>Lanzamientos rápidos</h3><p>De la idea a producción sin sacrificar calidad.</p></Card>
        </div>
      </div>
    </div>
  </section>

  <!-- Watch Our Story -->
  <section class="section" aria-labelledby="story-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow">Nuestra historia</span>
        <h2 class="section-title" id="story-title">Ocho años construyendo con nuestros clientes</h2>
      </div>
      <div class="row g-4">
        <div class="col-md-4" style="border-left:3px solid var(--color-accent); padding-left:var(--space-5);">
          <h3>2016 — El comienzo</h3>
          <p>Tres fundadores, un departamento y la convicción de que la tecnología debía ser accesible.</p>
        </div>
        <div class="col-md-4" style="border-left:3px solid var(--color-accent); padding-left:var(--space-5);">
          <h3>2020 — Escalamos</h3>
          <p>El equipo creció a 25 personas y abrimos operación remota en 3 países.</p>
        </div>
        <div class="col-md-4" style="border-left:3px solid var(--color-accent); padding-left:var(--space-5);">
          <h3>2024 — Hoy</h3>
          <p>Más de 120 proyectos entregados y un equipo de 40+ especialistas.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Our Projects -->
  <section class="section" style="background:var(--color-bg-soft);" aria-labelledby="projects-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow">Portafolio</span>
        <h2 class="section-title" id="projects-title">Proyectos que hablan por sí solos</h2>
      </div>
      <ProjectsGrid limit={2} />
      <div style="text-align:center; margin-top:var(--space-6);">
        <a href="/projects" class="card__link">Ver todos los proyectos <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></a>
      </div>
    </div>
  </section>

  <!-- Our Plans -->
  <section class="section" aria-labelledby="plans-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow">Planes</span>
        <h2 class="section-title" id="plans-title">Un plan para cada etapa de tu negocio</h2>
      </div>
      <Plans />
    </div>
  </section>

  <Newsletter />

  <!-- Testimonials + Client logos -->
  <section class="section" style="background:var(--color-primary);" aria-labelledby="testimonials-title">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow eyebrow--inverse">Clientes</span>
        <h2 class="section-title" style="color:#fff;" id="testimonials-title">Lo que dicen de nosotros</h2>
      </div>
      <Testimonials variant="dark" />
    </div>
  </section>
  <section class="section">
    <div class="container">
      <ClientLogos />
    </div>
  </section>

  <CtaBand
    title="¿Listo para dar el siguiente paso?"
    text="Agenda una consulta gratuita y descubre cómo podemos impulsar tu negocio digital."
    ctaPrimary={{ label: 'Agendar ahora', href: '/contact-us' }}
    ctaSecondary={{ label: 'Ver proyectos', href: '/projects' }}
  />

  <Footer />
  <WhatsAppButton />
  <ScrollTop />
  <CookieBanner />

  <script>
    import { initSectionSwipers } from '../scripts/section-swipers';
    import { initScrollReveal } from '../scripts/scroll-reveal';
    initSectionSwipers();
    initScrollReveal();
  </script>
</BaseLayout>
```

- [ ] **Step 2: Run the full test suite and type check**

Run: `pnpm test`
Expected: all lib tests pass (nav-scroll, scroll-visibility, cookie-consent, form-validation, counters).

Run: `pnpm check`
Expected: 0 errors.

- [ ] **Step 3: Build and manually verify the whole homepage**

Run: `pnpm build && pnpm preview`, open the printed URL.
Expected: scrolling top to bottom shows, in order: nav-over-hero → hero (3-line reveal) → About (3 cards + image + animated stats) → services carousel (swipeable, 3 slides visible on desktop) → dark "Why choose us" glass cards → "Watch our story" 3-column timeline → 2 featured projects with a "ver todos" link → 3 pricing plans → newsletter band → dark testimonials + client logos → accent CTA band → footer. Each `section__head` fades up into view the first time it's scrolled into the viewport (WOW.js + Animate.css). No console errors. WhatsApp button absent (no env var). Cookie banner appears once per fresh browser profile.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble the full homepage from all sections"
```

---

## Task 24: about-us.astro

**Files:**
- Create: `src/pages/about-us.astro`

**Interfaces:**
- Consumes: `PageLayout` (Task 12), `Card` (Task 10), `ProcessSteps` (Task 18), `StatsCounter` (Task 21), `initScrollReveal` (Task 22).

- [ ] **Step 1: Write the page**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import Card from '../components/elements/Card.astro';
import ProcessSteps from '../components/sections/ProcessSteps.astro';
import StatsCounter from '../components/sections/StatsCounter.astro';
---
<PageLayout
  title="Nosotros | Genesys"
  description="Conoce al equipo detrás de Genesys y nuestro proceso de trabajo."
  subhero={{
    eyebrow: 'Sobre nosotros',
    title: 'Nuestra historia',
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label: 'Nosotros' }],
  }}
  cta={{
    title: 'Hablemos de tu proyecto',
    text: 'Diseñamos soluciones a medida para empresas que buscan crecer de manera inteligente.',
    ctaPrimary: { label: 'Contactar', href: '/contact-us' },
    ctaSecondary: { label: 'Ver casos de éxito', href: '/projects' },
  }}
>
  <section class="section">
    <div class="container">
      <div class="row align-items-center g-5 mb-5">
        <div class="col-lg-6">
          <span class="eyebrow">Quiénes somos</span>
          <h2 class="section-title">
            No somos una agencia más. Somos tu <span class="accent">equipo de producto</span>.
          </h2>
          <p class="section-lead">
            Fundada en 2016, Genesys nació de una idea simple: las empresas merecen tecnología de
            nivel enterprise sin los precios astronómicos ni la burocracia de las grandes consultoras.
            Hoy somos un equipo de más de 40 especialistas en 8 países.
          </p>
        </div>
        <div class="col-lg-6">
          <Card icon="target"><h3>Misión</h3><p>Democratizar el acceso a tecnología de punta para empresas B2B de cualquier tamaño.</p></Card>
        </div>
      </div>

      <StatsCounter
        items={[
          { value: 120, suffix: '+', label: 'Proyectos entregados', sub: 'En 8 países' },
          { value: 8, label: 'Años de experiencia', sub: 'Desde 2016' },
          { value: 98, suffix: '%', label: 'Satisfacción del cliente', sub: 'NPS · 2024' },
        ]}
      />
    </div>
  </section>

  <section class="section" style="background:var(--color-bg-soft);">
    <div class="container">
      <div class="section__head section__head--center wow animate__fadeInUp" data-wow-duration=".7s">
        <span class="eyebrow">Cómo trabajamos</span>
        <h2 class="section-title">Nuestro proceso, paso a paso</h2>
      </div>
      <ProcessSteps />
    </div>
  </section>
</PageLayout>

<script>
  import { initScrollReveal } from '../scripts/scroll-reveal';
  initScrollReveal();
</script>
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, visit `/about-us`.
Expected: default nav, dark sub-hero "Nuestra historia" with breadcrumb, mission copy + card, animated stats, section headers fade up into view on scroll, 4-step process grid, accent CTA band, footer.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about-us.astro
git commit -m "feat: add about-us page"
```

---

## Task 25: services.astro

**Files:**
- Create: `src/pages/services.astro`

**Interfaces:**
- Consumes: `PageLayout` (Task 12), `ServicesGrid` (Task 14, full catalog — no `featuredOnly`).

- [ ] **Step 1: Write the page**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import ServicesGrid from '../components/sections/ServicesGrid.astro';
---
<PageLayout
  title="Servicios | Genesys"
  description="Catálogo completo de servicios de diseño, desarrollo y estrategia digital de Genesys."
  subhero={{
    eyebrow: 'Nuestros servicios',
    title: 'Lo que hacemos',
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label: 'Servicios' }],
  }}
  cta={{
    title: 'Empieza tu proyecto hoy',
    text: 'Cuéntanos tu idea y en 24 horas tendrás una propuesta personalizada.',
    ctaPrimary: { label: 'Empezar', href: '/contact-us' },
    ctaSecondary: { label: 'Conocer proceso', href: '/about-us' },
  }}
>
  <section class="section">
    <div class="container">
      <ServicesGrid />
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, visit `/services`.
Expected: all 4 services shown (including "Automatizaciones IA", which is excluded from the homepage's featured-only grid).

- [ ] **Step 3: Commit**

```bash
git add src/pages/services.astro
git commit -m "feat: add services page with full catalog"
```

---

## Task 26: projects.astro

**Files:**
- Create: `src/pages/projects.astro`

**Interfaces:**
- Consumes: `PageLayout` (Task 12), `ProjectsGrid` (Task 15, no `limit` — full gallery).

- [ ] **Step 1: Write the page**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import ProjectsGrid from '../components/sections/ProjectsGrid.astro';
---
<PageLayout
  title="Proyectos | Genesys"
  description="Portafolio de proyectos digitales entregados por Genesys."
  subhero={{
    eyebrow: 'Portafolio',
    title: 'Nuestros proyectos',
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label: 'Proyectos' }],
  }}
  cta={{
    title: 'Transforma tu presencia digital',
    text: 'Más de 120 empresas ya confían en nosotros para crecer en el entorno digital.',
    ctaPrimary: { label: 'Ver portafolio', href: '#' },
    ctaSecondary: { label: 'Agendar demo', href: '/contact-us' },
  }}
>
  <section class="section">
    <div class="container">
      <ProjectsGrid />
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, visit `/projects`.
Expected: all 3 projects shown, numbered 01–03.

- [ ] **Step 3: Commit**

```bash
git add src/pages/projects.astro
git commit -m "feat: add projects page with full gallery"
```

---

## Task 27: clients.astro

**Files:**
- Create: `src/pages/clients.astro`

**Interfaces:**
- Consumes: `PageLayout` (Task 12), `Testimonials` (Task 17, `variant="light"`), `ClientLogos` (Task 17).

- [ ] **Step 1: Write the page**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import Testimonials from '../components/sections/Testimonials.astro';
import ClientLogos from '../components/sections/ClientLogos.astro';
---
<PageLayout
  title="Clientes | Genesys"
  description="Testimonios de empresas que han trabajado con Genesys."
  subhero={{
    eyebrow: 'Testimonios',
    title: 'Empresas que confían en nosotros',
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label: 'Clientes' }],
  }}
  cta={{
    title: 'Únete a nuestros clientes',
    text: 'Agenda una consulta gratuita y descubre cómo podemos impulsar tu negocio digital.',
    ctaPrimary: { label: 'Agendar ahora', href: '/contact-us' },
  }}
>
  <section class="section">
    <div class="container">
      <Testimonials variant="light" />
    </div>
  </section>
  <section class="section" style="background:var(--color-bg-soft);">
    <div class="container">
      <ClientLogos />
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, visit `/clients`.
Expected: light-variant testimonial cards followed by the client logos grid.

- [ ] **Step 3: Commit**

```bash
git add src/pages/clients.astro
git commit -m "feat: add clients page with testimonials and logos"
```

---

## Task 28: contact-us.astro

**Files:**
- Create: `src/pages/contact-us.astro`

**Interfaces:**
- Consumes: `PageLayout` (Task 12), `ContactForm` (Task 20), `ContactStrip` (Task 18).

- [ ] **Step 1: Write the page**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import ContactForm from '../components/sections/ContactForm.astro';
import ContactStrip from '../components/sections/ContactStrip.astro';
---
<PageLayout
  title="Contacto | Genesys"
  description="Ponte en contacto con el equipo de Genesys."
  subhero={{
    eyebrow: 'Hablemos',
    title: 'Contáctanos',
    breadcrumb: [{ label: 'Inicio', href: '/' }, { label: 'Contacto' }],
  }}
  cta={{
    title: '¿Prefieres una llamada?',
    text: 'Agenda una sesión de 30 minutos sin compromiso.',
    ctaPrimary: { label: 'Agendar ahora', href: '#' },
    variant: 'dark',
  }}
>
  <section class="section">
    <div class="container">
      <div class="row g-5">
        <div class="col-lg-6">
          <span class="eyebrow">Escríbenos</span>
          <h2 class="section-title">Cuéntanos sobre tu proyecto</h2>
          <p class="section-lead">
            Completa el formulario y te contactaremos en menos de 24 horas para agendar una
            primera conversación.
          </p>
          <div style="margin-top:var(--space-8);">
            <ContactStrip />
          </div>
        </div>
        <div class="col-lg-6">
          <ContactForm />
        </div>
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, visit `/contact-us`.
Expected: copy + `ContactStrip` on the left, `ContactForm` on the right; submitting valid data hides the form and shows the success message (no network request, confirm via devtools Network tab).

- [ ] **Step 3: Commit**

```bash
git add src/pages/contact-us.astro
git commit -m "feat: add contact-us page with contact form and contact strip"
```

---

## Task 29: ui-kit.astro — component catalog page

**Files:**
- Create: `src/pages/ui-kit.astro`

**Interfaces:**
- Consumes: every component built in Tasks 5–21 (`Button`, `Badge`, `Eyebrow`, `Card`, `Alert`, `FormField`, `Nav`, `Hero`, `SubHero`, `Footer`, `CtaBand`, `ServiceCard`, `ProjectCard`, `Plans`, `Newsletter`, `ContactStrip`, `Testimonials`, `ClientLogos`, `ProcessSteps`, `StatsCounter`, `ScrollTop`, `CookieBanner`).

This page reuses `main.css`'s existing `.kit-*` classes (`.kit-section`, `.kit-nav__link`, `.kit-block`, `.kit-demo`, `.kit-snippet`) — the same classes the original `ui-kit.html` catalog already used, so no new CSS is needed.

- [ ] **Step 1: Write the page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/elements/Button.astro';
import Badge from '../components/elements/Badge.astro';
import Eyebrow from '../components/elements/Eyebrow.astro';
import Card from '../components/elements/Card.astro';
import Alert from '../components/elements/Alert.astro';
import FormField from '../components/elements/FormField.astro';
import ScrollTop from '../components/elements/ScrollTop.astro';

const sections = [
  { id: 's-buttons', label: 'Buttons' },
  { id: 's-badges', label: 'Badges & Eyebrows' },
  { id: 's-cards', label: 'Cards' },
  { id: 's-forms', label: 'Forms' },
  { id: 's-alerts', label: 'Alerts' },
  { id: 's-scrolltop', label: 'Scroll Top' },
  { id: 's-services', label: 'Service Cards' },
  { id: 's-plans', label: 'Plans' },
  { id: 's-stats', label: 'Stats Counter' },
];
---
<BaseLayout title="UI Kit | Genesys" description="Catálogo de componentes del starter Genesys.">
  <div class="kit-layout" style="display:flex;">
    <aside class="kit-sidebar" style="position:sticky; top:0; height:100vh; overflow-y:auto; flex-shrink:0; width:260px;">
      <nav>
        {sections.map((s) => (
          <a href={`#${s.id}`} class="kit-nav__link">{s.label}</a>
        ))}
      </nav>
    </aside>

    <main style="flex:1; padding:var(--space-8);">
      <section class="kit-section" id="s-buttons">
        <span class="kit-section__tag">Element</span>
        <h2 class="kit-section__title">Buttons</h2>
        <div class="kit-demo">
          <Button variant="primary">Comenzar ahora</Button>
          <Button variant="outline">Ver servicios</Button>
        </div>
        <div class="kit-snippet"><pre><code>&lt;Button variant="primary"&gt;Comenzar ahora&lt;/Button&gt;
&lt;Button variant="outline"&gt;Ver servicios&lt;/Button&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-badges">
        <span class="kit-section__tag">Element</span>
        <h2 class="kit-section__title">Badges &amp; Eyebrows</h2>
        <div class="kit-demo">
          <Badge variant="accent">Nuevo</Badge>
          <Badge variant="dark">Destacado</Badge>
          <Eyebrow>Nuestros servicios</Eyebrow>
        </div>
        <div class="kit-snippet"><pre><code>&lt;Badge variant="accent"&gt;Nuevo&lt;/Badge&gt;
&lt;Eyebrow&gt;Nuestros servicios&lt;/Eyebrow&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-cards">
        <span class="kit-section__tag">Element</span>
        <h2 class="kit-section__title">Cards</h2>
        <div class="kit-demo" style="display:grid; grid-template-columns:repeat(2,1fr); gap:var(--space-5);">
          <Card icon="layers"><h3>Diseño modular</h3><p>Componentes reutilizables y consistentes.</p></Card>
          <Card variant="dark" icon="zap" iconOnDark><h3>Alto rendimiento</h3><p>Interfaces rápidas y eficientes.</p></Card>
        </div>
        <div class="kit-snippet"><pre><code>&lt;Card icon="layers"&gt;&lt;h3&gt;Diseño modular&lt;/h3&gt;&lt;p&gt;...&lt;/p&gt;&lt;/Card&gt;
&lt;Card variant="dark" icon="zap" iconOnDark&gt;&lt;h3&gt;Alto rendimiento&lt;/h3&gt;&lt;p&gt;...&lt;/p&gt;&lt;/Card&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-forms">
        <span class="kit-section__tag">Element</span>
        <h2 class="kit-section__title">Forms</h2>
        <div class="kit-demo kit-demo--col" style="max-width:480px;">
          <FormField id="kit-email" name="email" type="email" label="Correo electrónico" />
          <FormField id="kit-service" name="service" type="select" label="Servicio de interés" options={['Diseño web', 'Desarrollo frontend']} />
        </div>
        <div class="kit-snippet"><pre><code>&lt;FormField id="c-email" name="email" type="email" label="Correo electrónico" /&gt;
&lt;FormField id="c-service" name="service" type="select" label="Servicio" options={['Diseño web']} /&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-alerts">
        <span class="kit-section__tag">Element</span>
        <h2 class="kit-section__title">Alerts</h2>
        <div class="kit-demo kit-demo--col">
          <Alert variant="success" icon="check-circle" title="¡Listo!">Los cambios fueron guardados correctamente.</Alert>
          <Alert variant="error" icon="x-circle" title="Error">No se pudo procesar el pago.</Alert>
        </div>
        <div class="kit-snippet"><pre><code>&lt;Alert variant="success" icon="check-circle" title="¡Listo!"&gt;Mensaje.&lt;/Alert&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-scrolltop">
        <span class="kit-section__tag">Element</span>
        <h2 class="kit-section__title">Scroll Top</h2>
        <div class="kit-demo" style="position:relative; min-height:80px;">
          <button class="scroll-top is-visible" style="position:static; transform:none;" aria-label="Volver arriba">
            <i data-lucide="arrow-up"></i>
          </button>
        </div>
        <div class="kit-snippet"><pre><code>&lt;ScrollTop /&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-services">
        <span class="kit-section__tag">Component</span>
        <h2 class="kit-section__title">Service Cards</h2>
        <p class="kit-section__desc">Ver también <code>ServicesGrid.astro</code>, que renderiza estas cards desde la colección <code>services</code>.</p>
        <div class="kit-snippet"><pre><code>&lt;ServicesGrid /&gt;
&lt;ServicesGrid featuredOnly /&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-plans">
        <span class="kit-section__tag">Component</span>
        <h2 class="kit-section__title">Plans</h2>
        <p class="kit-section__desc">Ver <code>Plans.astro</code>, que renderiza desde la colección <code>plans</code> (JSON en <code>src/content/plans/</code>).</p>
        <div class="kit-snippet"><pre><code>&lt;Plans /&gt;</code></pre></div>
      </section>

      <section class="kit-section" id="s-stats">
        <span class="kit-section__tag">Component</span>
        <h2 class="kit-section__title">Stats Counter</h2>
        <p class="kit-section__desc">Ver <code>StatsCounter.astro</code> — anima los números al entrar en el viewport.</p>
        <div class="kit-snippet"><pre><code>&lt;StatsCounter items={[{ value: 120, suffix: '+', label: 'Proyectos' }]} /&gt;</code></pre></div>
      </section>
    </main>
  </div>

  <ScrollTop />
</BaseLayout>
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, visit `/ui-kit`.
Expected: a left sidebar with 9 anchor links that scroll to each section; each section shows a live rendering of the real component plus a code snippet below it.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ui-kit.astro
git commit -m "feat: add ui-kit catalog page documenting the ported components"
```

---

## Task 30: Dockerfile, nginx config, docker-compose, .env.example

**Files:**
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `.gitignore` (already excludes `dist/`, `.env`, `node_modules/` from Task 1 setup)

**Interfaces:**
- Produces: a buildable Docker image serving `dist/` via Nginx, usable for both staging and prod via `docker-compose`.

- [ ] **Step 1: Write `.env.example`**

```bash
# Número de WhatsApp en formato internacional sin "+" (ej: 51999888777).
# Si se deja vacío, el botón flotante de WhatsApp no se renderiza.
PUBLIC_WHATSAPP_NUMBER=
```

- [ ] **Step 2: Write `Dockerfile`**

```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Serve stage ----
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Write `nginx.conf`**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    error_page 404 /404.html;
}
```

- [ ] **Step 4: Write `docker-compose.yml`**

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        PUBLIC_WHATSAPP_NUMBER: ${PUBLIC_WHATSAPP_NUMBER:-}
    image: astro-genesys:${TAG:-latest}
    ports:
      - "${PORT:-8080}:80"
    restart: unless-stopped
```

- [ ] **Step 5: Build the Docker image and verify it serves the site**

Run: `docker build -t astro-genesys:local .`
Expected: build succeeds through both stages.

Run: `docker run --rm -p 8080:80 astro-genesys:local`, then open `http://localhost:8080`.
Expected: the homepage loads with all styles and scripts working (nav scroll, hero reveal, forms). Stop the container with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile nginx.conf docker-compose.yml .env.example
git commit -m "chore: add Docker build (multi-stage Node+Nginx) and compose config for staging/prod"
```

---

## Task 31: Final integration check

**Files:**
- None created — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: all tests pass (`nav-scroll`, `scroll-visibility`, `cookie-consent`, `form-validation`, `counters` — 28 tests total across the 5 lib modules).

- [ ] **Step 2: Run the type/content checker**

Run: `pnpm check`
Expected: 0 errors, 0 warnings related to project code (Astro core hints are fine).

- [ ] **Step 3: Run a full production build**

Run: `pnpm build`
Expected: `Complete!`, and `dist/` contains `index.html`, `about-us/index.html`, `services/index.html`, `projects/index.html`, `clients/index.html`, `contact-us/index.html`, `ui-kit/index.html`, plus `assets/`.

- [ ] **Step 4: Manually browse every page in the preview server**

Run: `pnpm preview`, visit `/`, `/about-us`, `/services`, `/projects`, `/clients`, `/contact-us`, `/ui-kit`.
Expected: no console errors on any page; nav scroll/off-canvas, hero reveal, stats counters, both forms, cookie banner, and scroll-top button all behave as verified in their individual tasks.

- [ ] **Step 5: Confirm no stray temporary verification code remains**

Run: `git grep -n "temporal\|remove after confirming" -- 'src/pages/*.astro'`
Expected: no matches (all temporary blocks added during Tasks 10–21 for manual verification were removed in their own tasks).

- [ ] **Step 6: Final commit (only if any cleanup was needed in Steps 1–5)**

```bash
git add -A
git commit -m "chore: final integration verification pass"
```

(Skip this step if nothing needed changing — do not create an empty commit.)
