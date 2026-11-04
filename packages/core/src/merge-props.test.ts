import { describe, expect, it, vi } from 'vitest';
import { composeEventHandlers, mergeProps } from './merge-props';

describe('composeEventHandlers', () => {
  it('skips the second handler once the event is default-prevented', () => {
    const second = vi.fn();
    composeEventHandlers(() => {}, second)({ defaultPrevented: false });
    expect(second).toHaveBeenCalledOnce();
    composeEventHandlers(() => {}, second)({ defaultPrevented: true });
    expect(second).toHaveBeenCalledOnce();
  });
});

describe('mergeProps', () => {
  it('joins classes, merges styles, and lets later values win', () => {
    expect(
      mergeProps<Record<string, unknown>>(
        { className: 'a', style: { color: 'red', top: 0 }, id: 'x', title: 't' },
        { className: 'b', style: { color: 'blue' }, id: 'y', title: undefined },
      ),
    ).toEqual({ className: 'a b', style: { color: 'blue', top: 0 }, id: 'y', title: 't' });
  });

  it('runs later handlers first and lets them cancel earlier ones', () => {
    const calls: string[] = [];
    const merged = mergeProps<Record<string, unknown>>(
      { onClick: () => calls.push('base') },
      { onClick: () => calls.push('user') },
    );
    (merged.onClick as (event: object) => void)({ defaultPrevented: false });
    expect(calls).toEqual(['user', 'base']);

    const cancelled = vi.fn();
    const merged2 = mergeProps<Record<string, unknown>>(
      { onClick: cancelled },
      { onClick: (event: { preventDefault: () => void }) => event.preventDefault() },
    );
    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    (merged2.onClick as (e: typeof event) => void)(event);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('ignores null and undefined sources', () => {
    expect(mergeProps(null, { id: 'a' }, undefined)).toEqual({ id: 'a' });
  });
});
