import { describe, expect, it, vi } from 'vitest';
import { createMachine } from './create-machine';

type Event = { type: 'TOGGLE' } | { type: 'SET'; value: number } | { type: 'NOOP' };

const setup = (overrides: { entry?: () => void; exit?: () => void } = {}) =>
  createMachine<{ value: number }, Event, 'off' | 'on'>({
    initial: 'off',
    context: { value: 0 },
    states: {
      off: { on: { TOGGLE: 'on' }, exit: overrides.exit },
      on: {
        entry: overrides.entry,
        on: {
          TOGGLE: { target: 'off', guard: (context) => context.value === 0 },
          SET: { update: (_context, event) => ({ value: event.value }) },
        },
      },
    },
  });

describe('createMachine', () => {
  it('transitions and runs entry and exit hooks', () => {
    const entry = vi.fn();
    const exit = vi.fn();
    const machine = setup({ entry, exit });
    machine.send({ type: 'TOGGLE' });
    expect(machine.matches('on')).toBe(true);
    expect(entry).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledOnce();
  });

  it('updates context without changing state, and guards block transitions', () => {
    const machine = setup();
    machine.send({ type: 'TOGGLE' });
    machine.send({ type: 'SET', value: 5 });
    machine.send({ type: 'TOGGLE' });
    expect(machine.getSnapshot()).toEqual({ state: 'on', context: { value: 5 } });
  });

  it('keeps the snapshot identity and stays silent for unhandled events', () => {
    const machine = setup();
    const listener = vi.fn();
    machine.subscribe(listener);
    const before = machine.getSnapshot();
    machine.send({ type: 'NOOP' });
    expect(machine.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies subscribers until they unsubscribe', () => {
    const machine = setup();
    const listener = vi.fn();
    const unsubscribe = machine.subscribe(listener);
    machine.send({ type: 'TOGGLE' });
    unsubscribe();
    machine.send({ type: 'TOGGLE' });
    expect(listener).toHaveBeenCalledOnce();
  });
});
