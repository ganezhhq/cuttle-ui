import { expect, it } from 'vitest';
import { getPortalContainer, portal } from './portal';

it('resolves body, an element or a selector', () => {
  document.body.innerHTML = '<div id="host"></div>';
  const host = document.getElementById('host');
  expect(getPortalContainer()).toBe(document.body);
  expect(getPortalContainer(host)).toBe(host);
  expect(getPortalContainer('#host')).toBe(host);
  expect(getPortalContainer('#missing')).toBeNull();
});

it('moves the element and removes it on cleanup', () => {
  document.body.innerHTML = '<div id="host"></div>';
  const element = document.createElement('span');
  const cleanup = portal(element, '#host');
  expect(element.parentElement?.id).toBe('host');
  cleanup();
  expect(element.isConnected).toBe(false);
});
