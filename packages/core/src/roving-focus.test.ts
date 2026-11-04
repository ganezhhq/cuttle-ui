import { describe, expect, it } from 'vitest';
import { getNextIndex, rovingFocus } from './roving-focus';

describe('getNextIndex', () => {
  const base = { current: 0, count: 3 };

  it('moves along the orientation and ignores other keys', () => {
    expect(getNextIndex({ ...base, key: 'ArrowDown' })).toBe(1);
    expect(getNextIndex({ ...base, key: 'ArrowRight' })).toBeNull();
    expect(getNextIndex({ ...base, key: 'ArrowRight', orientation: 'horizontal' })).toBe(1);
    expect(getNextIndex({ ...base, key: 'a' })).toBeNull();
  });

  it('handles Home, End, loop and no loop', () => {
    expect(getNextIndex({ ...base, key: 'End' })).toBe(2);
    expect(getNextIndex({ ...base, current: 2, key: 'Home' })).toBe(0);
    expect(getNextIndex({ ...base, key: 'ArrowUp' })).toBe(2);
    expect(getNextIndex({ ...base, key: 'ArrowUp', loop: false })).toBe(0);
  });

  it('mirrors arrows in RTL', () => {
    const options = { ...base, orientation: 'horizontal' as const, dir: 'rtl' as const };
    expect(getNextIndex({ ...options, key: 'ArrowLeft' })).toBe(1);
    expect(getNextIndex({ ...options, key: 'ArrowRight' })).toBe(2);
  });

  it('skips disabled items and stays put when all are disabled', () => {
    expect(getNextIndex({ ...base, key: 'ArrowDown', isDisabled: (i) => i === 1 })).toBe(2);
    expect(getNextIndex({ ...base, key: 'Home', isDisabled: (i) => i === 0 })).toBe(1);
    expect(getNextIndex({ ...base, key: 'End', isDisabled: (i) => i === 2 })).toBe(1);
    expect(getNextIndex({ ...base, key: 'ArrowDown', isDisabled: () => true })).toBe(0);
    expect(getNextIndex({ current: 0, count: 0, key: 'ArrowDown' })).toBeNull();
  });
});

describe('rovingFocus', () => {
  it('keeps one tab stop and moves it with the keyboard', () => {
    document.body.innerHTML = `
      <div id="list">
        <button disabled>0</button><button id="one">1</button><button id="two">2</button>
      </div>`;
    const list = document.getElementById('list') as HTMLElement;
    const one = document.getElementById('one') as HTMLElement;
    const two = document.getElementById('two') as HTMLElement;

    const cleanup = rovingFocus(list, { selector: 'button' });
    expect([one.tabIndex, two.tabIndex]).toEqual([0, -1]);

    one.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    one.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(two);
    expect([one.tabIndex, two.tabIndex]).toEqual([-1, 0]);
    cleanup();
  });
});
