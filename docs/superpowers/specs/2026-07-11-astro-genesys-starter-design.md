# Astro Genesys Starter — Diseño

**Fecha:** 2026-07-11
**Estado:** Aprobado, pendiente de plan de implementación

## Contexto

Existe un UI-kit HTML/CSS/JS ya construido — **"Genesys | Starter Theme"**
(`https://github.com/studioneyra-digital/01-genesys-starter-2`) — un sitio
estático sin build process (Bootstrap 5 solo como grid, jQuery, WOW.js +
Animate.css, GSAP + ScrollTrigger, Swiper, Lucide Icons vía CDN). Define un
design system completo (paleta, tipografía Plus Jakarta Sans + Inter, tokens
CSS, catálogo de componentes documentado en `ui-kit.html`) y una arquitectura
de 6 páginas para un sitio corporativo/tech genérico ficticio llamado
"Genesys".

Este proyecto (`03-astro-genesys`) porta ese UI-kit a un **starter Astro
reutilizable**: un boilerplate que otros proyectos corporativos puedan clonar
y reconfigurar (cambiando solo contenido/branding), no un sitio final para un
cliente específico.

## Objetivo

Construir un starter Astro que:

1. Preserve el design system visual del UI-kit HTML tal cual (CSS, tokens,
   layout Bento Grid, animaciones) sin reescribir estilos.
2. Elimine la dependencia de jQuery, portando `main.js` a módulos ES nativos.
3. Estructure el contenido repetible (servicios, proyectos, testimonios,
   planes, equipo) como Astro Content Collections, para que reutilizar el
   starter en otro proyecto sea cuestión de reemplazar contenido, no código.
4. Quede listo para desplegarse vía Docker (build estático + Nginx) en un VPS
   propio, con entornos de staging y producción.

## Alcance (v1)

Las 6 páginas del UI-kit original, completas:

| Página | Contenido |
|---|---|
| `index.astro` | Hero · About Us · Servicios (slider) · Why Choose Us · Watch Our Story · Proyectos destacados · Planes · Newsletter · Contact |
| `about-us.astro` | Sub-hero · bio/valores · Proceso 01→04 · CTA band |
| `services.astro` | Catálogo completo de servicios · CTA band |
| `projects.astro` | Galería de proyectos · CTA band |
| `clients.astro` | Galería de testimonios · CTA band |
| `contact-us.astro` | Formulario + datos + mapa |
| `ui-kit.astro` | Catálogo del design system (sidebar nav con overflow vertical), portado de `ui-kit.html` |

Fuera de alcance para v1: backend real de formularios, CMS externo, tests
automatizados, internacionalización (queda en `es` como el original).

## Arquitectura

- **Astro**, `output: 'static'`. Sin frameworks UI (React/Vue/Svelte) —
  arquitectura MPA de páginas `.astro` + JS vanilla, coherente con el UI-kit
  original.
- **CSS intacto**: `main.css`, `animate.min.css`, `swiper-bundle.min.css`,
  `bootstrap-grid.min.css` se copian sin modificar a `public/assets/css/`
  y se cargan globalmente desde `BaseLayout.astro`, en el mismo orden que
  especifica el UI-kit (`animate → swiper → bootstrap-grid → main`).
- **JS modernizado**: `main.js` se divide en módulos ES nativos bajo
  `src/scripts/` (`nav.js`, `hero-reveal.js`, `counters.js`, `scroll-top.js`,
  `cookie-banner.js`, `whatsapp.js`, `swiper-init.js`, ...), eliminando
  jQuery. WOW.js, GSAP/ScrollTrigger, Swiper y Lucide Icons se mantienen como
  librerías independientes vendored/CDN, igual que en el original.
- Sin islands de framework: la interactividad usa `<script>` module tags
  estándar de Astro (procesados y bundleados por Vite), igual de simple que
  el patrón original pero sin jQuery.

## Componentes y páginas

Mapeo del catálogo `ui-kit.html` (Foundations / Elements / Components
primary / Components secondary) a componentes `.astro`:

```
src/
├── layouts/
│   ├── BaseLayout.astro      # <head>: meta/SEO/OG/Twitter/favicon, carga CSS/JS globales
│   └── PageLayout.astro      # Nav + Sub-hero + slot + CTA band + Footer (páginas internas)
├── components/
│   ├── elements/       Button, Badge, Card, FormField, Alert, Divider,
│   │                   Stepper, Avatar, Chip, Tooltip, Spinner, ProgressBar,
│   │                   ScrollTop, CookieBanner, Pagination, TrustBadge
│   ├── sections/       Nav, Hero, SubHero, Footer, CtaBand, Faqs,
│   │                   ServiceCard, ServicesGrid, ProjectCard, ProjectsGrid,
│   │                   Plans, Newsletter, ContactStrip, Testimonials,
│   │                   PostCard, ClientLogos, ProcessSteps
│   ├── advanced/       MegaMenu, OffCanvasNav, Marquee, Tabs,
│   │                   ComparisonTable, StatsCounter, Team, Timeline,
│   │                   VideoSection, GalleryFilter, Modal, EmptyState
│   └── WhatsAppButton.astro   # configurable vía env, oculto si no hay número
└── pages/
    ├── index.astro
    ├── about-us.astro
    ├── services.astro
    ├── projects.astro
    ├── clients.astro
    ├── contact-us.astro
    └── ui-kit.astro
```

Convenciones heredadas del UI-kit:

- Nav y footer se replican como bloque canónico en cada página (mejor SEO,
  sin depender de JS) — en Astro esto se resuelve de forma natural con
  `PageLayout.astro` + slots, sin duplicar markup realmente.
- `index.astro` usa `nav--over-hero` (texto claro sobre hero oscuro); páginas
  internas usan `.nav` a secas (texto oscuro sobre sub-hero crema).
- Patrón de página interna: nav + sub-hero (`.subhero` con eyebrow, título,
  breadcrumb) + contenido + banda CTA (`.cta-band`) + footer.

## Content Collections

`src/content/config.ts` define 5 colecciones con schema Zod:

```ts
import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    icon: z.string(),          // nombre de icono Lucide
    excerpt: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
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
    avatar: z.string().optional(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

const plans = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    price: z.number(),
    period: z.enum(['month', 'year', 'one-time']),
    features: z.array(z.string()),
    highlighted: z.boolean().default(false),
  }),
});

const team = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string(),
    socials: z.object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { services, projects, testimonials, plans, team };
```

Contenido de muestra: branding genérico "Genesys" (tech/B2B), copy e
imágenes de [Unsplash](https://unsplash.com) con temática tecnología, tal
como especifica el UI-kit original.

## Formularios y WhatsApp

- **Formularios (contacto + newsletter): solo front-end.** Validación en
  cliente y estado de éxito simulado, sin envío real. Se marca con `// TODO`
  el punto de integración futura (ej. FormSubmit.co), igual que en el UI-kit
  original — no se cambia esta decisión.
- **Botón de WhatsApp flotante**: componente `WhatsAppButton.astro`,
  configurable vía variable de entorno pública (`PUBLIC_WHATSAPP_NUMBER`).
  Si no se define, el componente no se renderiza. Siempre visible
  (`position: fixed`, bottom-right) cuando está activo, en todos los
  viewports.

## Repo, Docker y Deploy

- **Package manager:** `pnpm`.
- **Repo:** `studioneyra-digital/03-astro-genesys` (nuevo, separado del
  UI-kit HTML). Se inicializa git localmente con commit inicial; el entorno
  actual no tiene `gh` CLI disponible, así que el repo remoto en GitHub debe
  crearse manualmente (vacío) antes de poder hacer `git push`.
- **Output:** Astro `output: 'static'`.
- **Dockerfile multi-stage:**
  1. `node:20-alpine` + `pnpm install` + `astro build`.
  2. `nginx:alpine` sirviendo `dist/` con `nginx.conf` propio (gzip, cache
     headers para assets estáticos).
- **docker-compose.yml** con configuración diferenciada para staging y
  producción (mismo Dockerfile; build args o env vars para `PUBLIC_SITE_URL`,
  `robots.txt`, etc. si difieren entre entornos).

## Testing / verificación

Sin suite de tests automatizados en v1 — es un sitio de marketing estático.
Se usa `astro check` para validar tipos y el schema de las Content
Collections, más verificación manual en navegador (nav, formularios,
responsive en breakpoints `sm/md/lg/xl` de Bootstrap) antes de cada release.
Queda abierta la posibilidad de añadir Playwright más adelante si el starter
crece en complejidad.

## Decisiones explícitas (no cambiar sin motivo)

- No se usan frameworks UI (React/Vue/Svelte) ni islands — JS vanilla en
  módulos ES.
- `main.css` y los assets vendored (Bootstrap-grid, Animate.css, Swiper,
  WOW.js, GSAP) se mantienen sin modificar; solo se reorganiza su ubicación
  dentro de `public/assets/`.
- Formularios sin backend real por ahora.
- Botón de WhatsApp oculto si no hay número configurado.
- Sin Docker/deploy real todavía — se prepara el Dockerfile pero el deploy en
  el VPS queda para una fase posterior.
