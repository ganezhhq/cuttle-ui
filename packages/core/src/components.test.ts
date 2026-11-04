import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  autoResize,
  createCheckboxMachine,
  createRadioGroupMachine,
  createSwitchMachine,
  getFieldDescribedBy,
  getFieldIds,
  toCheckedState,
} from './controls';
import { createPopoverMachine, createSelectMachine, createTooltipMachine } from './overlays';

describe('createCheckboxMachine', () => {
  it('starts from each state and toggles', () => {
    const machine = createCheckboxMachine();
    expect(toCheckedState(machine.getSnapshot().state)).toBe(false);
    machine.send({ type: 'TOGGLE' });
    expect(toCheckedState(machine.getSnapshot().state)).toBe(true);
    machine.send({ type: 'TOGGLE' });
    expect(toCheckedState(machine.getSnapshot().state)).toBe(false);
  });

  it('checks when toggled from indeterminate', () => {
    const machine = createCheckboxMachine('indeterminate');
    expect(toCheckedState(machine.getSnapshot().state)).toBe('indeterminate');
    machine.send({ type: 'TOGGLE' });
    expect(toCheckedState(machine.getSnapshot().state)).toBe(true);
  });
});

describe('createSwitchMachine', () => {
  it('toggles', () => {
    const machine = createSwitchMachine(true);
    expect(machine.matches('on')).toBe(true);
    machine.send({ type: 'TOGGLE' });
    expect(machine.matches('off')).toBe(true);
  });
});

describe('createRadioGroupMachine', () => {
  it('selects a value and ignores a repeat', () => {
    const machine = createRadioGroupMachine('a');
    const listener = vi.fn();
    machine.subscribe(listener);
    machine.send({ type: 'SELECT', value: 'a' });
    expect(listener).not.toHaveBeenCalled();
    machine.send({ type: 'SELECT', value: 'b' });
    expect(machine.getSnapshot().context.value).toBe('b');
  });
});

describe('field helpers', () => {
  const ids = getFieldIds('x');

  it('derives part IDs', () => {
    expect(ids).toEqual({
      control: 'x-control',
      label: 'x-label',
      description: 'x-description',
      error: 'x-error',
    });
  });

  it('describes with only the parts that exist', () => {
    expect(getFieldDescribedBy(ids, { description: false, error: false })).toBeUndefined();
    expect(getFieldDescribedBy(ids, { description: true, error: false })).toBe('x-description');
    expect(getFieldDescribedBy(ids, { description: true, error: true })).toBe(
      'x-description x-error',
    );
  });
});

describe('autoResize', () => {
  it('matches the content height and stops after destroy', () => {
    const textarea = document.createElement('textarea');
    Object.defineProperty(textarea, 'scrollHeight', { value: 120, configurable: true });
    const { destroy } = autoResize(textarea);
    expect(textarea.style.height).toBe('120px');
    Object.defineProperty(textarea, 'scrollHeight', { value: 200, configurable: true });
    textarea.dispatchEvent(new Event('input'));
    expect(textarea.style.height).toBe('200px');
    destroy();
    Object.defineProperty(textarea, 'scrollHeight', { value: 300, configurable: true });
    textarea.dispatchEvent(new Event('input'));
    expect(textarea.style.height).toBe('200px');
  });
});

describe('createPopoverMachine', () => {
  it('opens and closes', () => {
    const machine = createPopoverMachine();
    machine.send({ type: 'OPEN' });
    expect(machine.matches('open')).toBe(true);
    machine.send({ type: 'CLOSE' });
    expect(machine.matches('closed')).toBe(true);
  });
});

describe('createTooltipMachine', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('opens after the delay', () => {
    const machine = createTooltipMachine({ openDelay: 100 });
    machine.send({ type: 'SHOW' });
    expect(machine.matches('opening')).toBe(true);
    vi.advanceTimersByTime(100);
    expect(machine.matches('open')).toBe(true);
  });

  it('cancels when hidden before the delay ends', () => {
    const machine = createTooltipMachine({ openDelay: 100 });
    machine.send({ type: 'SHOW' });
    machine.send({ type: 'HIDE' });
    vi.advanceTimersByTime(200);
    expect(machine.matches('closed')).toBe(true);
  });

  it('stays open if shown again while closing', () => {
    const machine = createTooltipMachine({ openDelay: 0, closeDelay: 100 });
    machine.send({ type: 'SHOW' });
    vi.advanceTimersByTime(0);
    machine.send({ type: 'HIDE' });
    expect(machine.matches('closing')).toBe(true);
    machine.send({ type: 'SHOW' });
    vi.advanceTimersByTime(200);
    expect(machine.matches('open')).toBe(true);
  });

  it('closes at once on dismiss', () => {
    const machine = createTooltipMachine({ openDelay: 0 });
    machine.send({ type: 'SHOW' });
    vi.advanceTimersByTime(0);
    machine.send({ type: 'DISMISS' });
    expect(machine.matches('closed')).toBe(true);
  });
});

describe('createSelectMachine', () => {
  it('opens with a highlight, moves it and selects', () => {
    const machine = createSelectMachine('a');
    machine.send({ type: 'OPEN', highlighted: 0 });
    expect(machine.getSnapshot().context.highlighted).toBe(0);
    machine.send({ type: 'HIGHLIGHT', index: 2 });
    expect(machine.getSnapshot().context.highlighted).toBe(2);
    machine.send({ type: 'SELECT', value: 'c' });
    expect(machine.getSnapshot()).toEqual({
      state: 'closed',
      context: { value: 'c', highlighted: -1 },
    });
  });

  it('keeps the value when closed without selecting', () => {
    const machine = createSelectMachine('a');
    machine.send({ type: 'OPEN', highlighted: 1 });
    machine.send({ type: 'CLOSE' });
    expect(machine.getSnapshot().context).toEqual({ value: 'a', highlighted: -1 });
  });
});
