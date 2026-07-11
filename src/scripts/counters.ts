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
