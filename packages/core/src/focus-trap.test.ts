import { afterEach, describe, expect, it } from 'vitest';
import { focusTrap, getTabbable } from './focus-trap';

const press = (shiftKey = false) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  document.activeElement?.dispatchEvent(event);
  return event;
};

describe('focusTrap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const setup = () => {
    document.body.innerHTML = `
      <button id="outside">outside</button>
      <div id="trap">
        <button id="a">a</button>
        <button disabled>disabled</button>
        <div hidden><button>hidden</button></div>
        <button tabindex="-1">skipped</button>
        <button id="b">b</button>
      </div>`;
    return document.getElementById('trap') as HTMLElement;
  };

  it('finds only tabbable elements', () => {
    expect(getTabbable(setup()).map((el) => el.id)).toEqual(['a', 'b']);
  });

  it('focuses the first item and wraps Tab in both directions', () => {
    const release = focusTrap(setup());
    expect(document.activeElement?.id).toBe('a');
    expect(press(true).defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('b');
    expect(press().defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('a');
    release();
  });

  it('pulls escaped focus back inside', () => {
    const release = focusTrap(setup());
    document.getElementById('outside')?.focus();
    expect(document.activeElement?.id).toBe('a');
    release();
  });

  it('returns focus on release unless disabled', () => {
    const trap = setup();
    const outside = document.getElementById('outside') as HTMLElement;
    outside.focus();
    focusTrap(trap)();
    expect(document.activeElement).toBe(outside);

    outside.focus();
    focusTrap(trap, { returnFocus: false })();
    expect(document.activeElement?.id).toBe('a');
  });

  it('focuses the container when it has nothing tabbable', () => {
    document.body.innerHTML = '<div id="empty"></div>';
    const empty = document.getElementById('empty') as HTMLElement;
    const release = focusTrap(empty);
    expect(document.activeElement).toBe(empty);
    expect(press().defaultPrevented).toBe(true);
    release();
  });
});
