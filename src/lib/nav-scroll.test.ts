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
