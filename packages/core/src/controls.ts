import { createMachine } from './create-machine';
import type { Machine } from './create-machine';

export type CheckedState = boolean | 'indeterminate';
export type CheckboxStateName = 'unchecked' | 'checked' | 'indeterminate';
export type CheckboxEvent = { type: 'TOGGLE' };

const checkboxStates: Record<string, CheckboxStateName> = {
  true: 'checked',
  false: 'unchecked',
  indeterminate: 'indeterminate',
};

/** A checkbox. Toggling from indeterminate checks it. */
export function createCheckboxMachine(
  defaultChecked: CheckedState = false,
): Machine<null, CheckboxEvent, CheckboxStateName> {
  return createMachine<null, CheckboxEvent, CheckboxStateName>({
    initial: checkboxStates[String(defaultChecked)] as CheckboxStateName,
    context: null,
    states: {
      unchecked: { on: { TOGGLE: 'checked' } },
      checked: { on: { TOGGLE: 'unchecked' } },
      indeterminate: { on: { TOGGLE: 'checked' } },
    },
  });
}

/** Converts a machine state name to the value that components expose. */
export function toCheckedState(state: CheckboxStateName): CheckedState {
  return state === 'indeterminate' ? state : state === 'checked';
}

export type SwitchStateName = 'off' | 'on';
export type SwitchEvent = { type: 'TOGGLE' };

/** A switch that is either on or off. */
export function createSwitchMachine(
  defaultOn = false,
): Machine<null, SwitchEvent, SwitchStateName> {
  return createMachine<null, SwitchEvent, SwitchStateName>({
    initial: defaultOn ? 'on' : 'off',
    context: null,
    states: {
      off: { on: { TOGGLE: 'on' } },
      on: { on: { TOGGLE: 'off' } },
    },
  });
}

export interface RadioGroupContext {
  value: string | undefined;
}
export type RadioGroupEvent = { type: 'SELECT'; value: string };

/** Holds the selected value of a radio group. */
export function createRadioGroupMachine(
  defaultValue?: string,
): Machine<RadioGroupContext, RadioGroupEvent, 'idle'> {
  return createMachine<RadioGroupContext, RadioGroupEvent, 'idle'>({
    initial: 'idle',
    context: { value: defaultValue },
    states: {
      idle: {
        on: {
          SELECT: {
            guard: (context, event) => context.value !== event.value,
            update: (_, event) => ({ value: event.value }),
          },
        },
      },
    },
  });
}

export interface FieldIds {
  control: string;
  label: string;
  description: string;
  error: string;
}

/** Derives the IDs that connect a field's label, description and error to its control. */
export function getFieldIds(rootId: string): FieldIds {
  return {
    control: `${rootId}-control`,
    label: `${rootId}-label`,
    description: `${rootId}-description`,
    error: `${rootId}-error`,
  };
}

/** Builds `aria-describedby` from the parts that are present. */
export function getFieldDescribedBy(
  ids: FieldIds,
  present: { description: boolean; error: boolean },
): string | undefined {
  const parts = [present.description && ids.description, present.error && ids.error].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(' ') : undefined;
}

/**
 * Makes a textarea grow with its text. Runs now and on every input event, and also
 * when you call the returned object's `update`, for example after a controlled change.
 */
export function autoResize(textarea: HTMLTextAreaElement): {
  update: () => void;
  destroy: () => void;
} {
  const update = () => {
    textarea.style.height = 'auto';
    const borders = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
  };
  update();
  textarea.addEventListener('input', update);
  return { update, destroy: () => textarea.removeEventListener('input', update) };
}
