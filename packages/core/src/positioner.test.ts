import { expect, it, vi } from 'vitest';
import { positioner } from './positioner';

it('positions the floating element, sets placement and cleans up', async () => {
  class ObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ObserverStub);
  vi.stubGlobal('IntersectionObserver', ObserverStub);

  const reference = document.body.appendChild(document.createElement('button'));
  const floating = document.body.appendChild(document.createElement('div'));
  const cleanup = positioner(reference, floating, { placement: 'top', offset: 4 });

  await vi.waitFor(() => expect(floating.dataset.placement).toBeTruthy());
  expect(floating.style.position).toBe('fixed');
  expect(floating.style.left).toMatch(/px$/);
  expect(floating.style.top).toMatch(/px$/);
  cleanup();
  vi.unstubAllGlobals();
});
