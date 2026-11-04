import { expect, it } from 'vitest';
import { lockScroll } from './scroll-lock';

it('counts nested locks and restores the original styles', () => {
  document.body.style.overflow = 'scroll';
  const first = lockScroll();
  const second = lockScroll();
  expect(document.body.style.overflow).toBe('hidden');

  first();
  first();
  expect(document.body.style.overflow).toBe('hidden');

  second();
  expect(document.body.style.overflow).toBe('scroll');
});
