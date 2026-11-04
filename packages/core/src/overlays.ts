import { createMachine } from './create-machine';
import type { Machine } from './create-machine';
import { createDialogMachine } from './dialog';
import type { DialogMachine } from './dialog';

/** A popover has the same open and closed states as a dialog. */
export function createPopoverMachine(defaultOpen = false): DialogMachine {
  return createDialogMachine(defaultOpen);
}

export type TooltipStateName = 'closed' | 'opening' | 'open' | 'closing';
export type TooltipEvent =
  { type: 'SHOW' } | { type: 'HIDE' } | { type: 'DISMISS' } | { type: 'TIMER' };

export interface TooltipOptions {
  /** Milliseconds to wait before showing. Defaults to 300. */
  openDelay?: number;
  /** Milliseconds to wait before hiding, so the pointer can reach the tooltip. Defaults to 100. */
  closeDelay?: number;
}

/** A tooltip with delays. Send DISMISS on unmount to clear any running timer. */
export function createTooltipMachine(
  options: TooltipOptions = {},
): Machine<null, TooltipEvent, TooltipStateName> {
  const { openDelay = 300, closeDelay = 100 } = options;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => clearTimeout(timer);
  const start = (delay: number) => {
    timer = setTimeout(() => machine.send({ type: 'TIMER' }), delay);
  };

  const machine: Machine<null, TooltipEvent, TooltipStateName> = createMachine<
    null,
    TooltipEvent,
    TooltipStateName
  >({
    initial: 'closed',
    context: null,
    states: {
      closed: { on: { SHOW: 'opening' } },
      opening: {
        entry: () => start(openDelay),
        exit: clear,
        on: { TIMER: 'open', HIDE: 'closed', DISMISS: 'closed' },
      },
      open: { on: { HIDE: 'closing', DISMISS: 'closed' } },
      closing: {
        entry: () => start(closeDelay),
        exit: clear,
        on: { TIMER: 'closed', SHOW: 'open', DISMISS: 'closed' },
      },
    },
  });
  return machine;
}

export interface SelectContext {
  value: string | undefined;
  /** The index of the highlighted option while open, or -1. */
  highlighted: number;
}

export type SelectEvent =
  | { type: 'OPEN'; highlighted: number }
  | { type: 'CLOSE' }
  | { type: 'HIGHLIGHT'; index: number }
  | { type: 'SELECT'; value: string };

/** A select with a value and a highlighted option. */
export function createSelectMachine(
  defaultValue?: string,
): Machine<SelectContext, SelectEvent, 'closed' | 'open'> {
  return createMachine<SelectContext, SelectEvent, 'closed' | 'open'>({
    initial: 'closed',
    context: { value: defaultValue, highlighted: -1 },
    states: {
      closed: {
        on: {
          OPEN: {
            target: 'open',
            update: (context, event) => ({ ...context, highlighted: event.highlighted }),
          },
        },
      },
      open: {
        on: {
          CLOSE: {
            target: 'closed',
            update: (context) => ({ ...context, highlighted: -1 }),
          },
          HIGHLIGHT: {
            update: (context, event) => ({ ...context, highlighted: event.index }),
          },
          SELECT: {
            target: 'closed',
            update: (_, event) => ({ value: event.value, highlighted: -1 }),
          },
        },
      },
    },
  });
}
