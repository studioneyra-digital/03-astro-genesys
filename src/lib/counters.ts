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
