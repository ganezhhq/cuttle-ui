import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTypeahead } from './typeahead';

const labels = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry'];

describe('createTypeahead', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches several typed characters and stays on the current match', () => {
    const search = createTypeahead();
    expect(search('b', labels, 0)).toBe(2);
    expect(search('l', labels, 2)).toBe(3);
  });

  it('cycles when one letter repeats, wrapping at the end', () => {
    const search = createTypeahead();
    expect(search('a', labels, 4)).toBe(0);
    expect(search('a', labels, 0)).toBe(1);
    expect(search('a', labels, 1)).toBe(0);
  });

  it('resets after the timeout and ignores non-character keys', () => {
    const search = createTypeahead({ timeout: 100 });
    expect(search('ArrowDown', labels, 0)).toBe(-1);
    expect(search('c', labels, 0)).toBe(4);
    vi.advanceTimersByTime(100);
    expect(search('b', labels, 4)).toBe(2);
    expect(search('z', labels, 2)).toBe(-1);
  });
});
