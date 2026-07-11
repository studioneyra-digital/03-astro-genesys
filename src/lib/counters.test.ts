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
