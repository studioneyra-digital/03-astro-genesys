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
