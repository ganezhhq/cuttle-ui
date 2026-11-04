import { describe, expect, it, vi } from 'vitest';
import { createDialogMachine } from './dialog';

describe('createDialogMachine', () => {
  it('starts closed by default', () => {
    expect(createDialogMachine().getSnapshot().state).toBe('closed');
  });

  it('can start open', () => {
    expect(createDialogMachine(true).getSnapshot().state).toBe('open');
  });

  it('opens and closes', () => {
    const machine = createDialogMachine();
    machine.send({ type: 'OPEN' });
    expect(machine.matches('open')).toBe(true);
    machine.send({ type: 'CLOSE' });
    expect(machine.matches('closed')).toBe(true);
  });

  it('toggles', () => {
    const machine = createDialogMachine();
    machine.send({ type: 'TOGGLE' });
    expect(machine.matches('open')).toBe(true);
    machine.send({ type: 'TOGGLE' });
    expect(machine.matches('closed')).toBe(true);
  });

  it('does not notify when an event changes nothing', () => {
    const machine = createDialogMachine();
    const listener = vi.fn();
    machine.subscribe(listener);
    machine.send({ type: 'CLOSE' });
    expect(listener).not.toHaveBeenCalled();
  });
});
