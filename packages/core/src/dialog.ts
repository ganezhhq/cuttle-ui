import { createMachine } from './create-machine';
import type { Machine } from './create-machine';

export type DialogState = 'closed' | 'open';
export type DialogEvent = { type: 'OPEN' } | { type: 'CLOSE' } | { type: 'TOGGLE' };
export type DialogMachine = Machine<null, DialogEvent, DialogState>;

/** The open and closed states of a dialog. */
export function createDialogMachine(defaultOpen = false): DialogMachine {
  return createMachine<null, DialogEvent, DialogState>({
    initial: defaultOpen ? 'open' : 'closed',
    context: null,
    states: {
      closed: { on: { OPEN: 'open', TOGGLE: 'open' } },
      open: { on: { CLOSE: 'closed', TOGGLE: 'closed' } },
    },
  });
}
