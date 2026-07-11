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
