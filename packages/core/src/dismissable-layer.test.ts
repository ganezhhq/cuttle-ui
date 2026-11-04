import { afterEach, describe, expect, it, vi } from 'vitest';
import { dismissableLayer } from './dismissable-layer';

const el = () => document.body.appendChild(document.createElement('div'));
const escape = () =>
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
const pointer = (target: Element) =>
  target.dispatchEvent(new Event('pointerdown', { bubbles: true }));

describe('dismissableLayer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('dismisses on Escape and outside press, but not inside or excluded presses', () => {
    const layer = el();
    const trigger = el();
    const onDismiss = vi.fn();
    const cleanup = dismissableLayer(layer, { onDismiss, exclude: [trigger] });

    pointer(layer);
    pointer(trigger);
    expect(onDismiss).not.toHaveBeenCalled();

    pointer(document.body);
    expect(onDismiss).toHaveBeenLastCalledWith('outside');
    escape();
    expect(onDismiss).toHaveBeenLastCalledWith('escape');
    cleanup();
  });

  it('only lets the topmost layer react, then hands over after cleanup', () => {
    const lower = vi.fn();
    const upper = vi.fn();
    const cleanLower = dismissableLayer(el(), { onDismiss: lower });
    const cleanUpper = dismissableLayer(el(), { onDismiss: upper });

    escape();
    expect(upper).toHaveBeenCalledOnce();
    expect(lower).not.toHaveBeenCalled();

    cleanUpper();
    escape();
    expect(lower).toHaveBeenCalledOnce();
    cleanLower();
  });

  it('respects the disable flags and stops listening after cleanup', () => {
    const onDismiss = vi.fn();
    const cleanup = dismissableLayer(el(), {
      onDismiss,
      closeOnEscape: false,
      closeOnOutsidePointer: false,
    });
    escape();
    pointer(document.body);
    cleanup();

    const after = vi.fn();
    dismissableLayer(el(), { onDismiss: after })();
    escape();
    expect(onDismiss).not.toHaveBeenCalled();
    expect(after).not.toHaveBeenCalled();
  });
});
