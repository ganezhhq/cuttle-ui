import type { ComponentPropsWithRef, ReactElement } from 'react';
import { createSwitchMachine } from '@cuttle-ui/core';
import { useFieldControl } from './field';
import { useMachine } from './primitives';

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'value' | 'defaultChecked' | 'onChange'
> {
  /** The state, when you control it. */
  checked?: boolean;
  /** The initial state, when the switch controls itself. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Adds a hidden input, so the switch is sent with a form. */
  name?: string;
  /** The value sent with a form while on. Defaults to `on`. */
  value?: string;
}

/** A control that turns a setting on or off straight away. */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onClick,
  name,
  value = 'on',
  className,
  disabled,
  ...props
}: SwitchProps): ReactElement {
  const [snapshot, send] = useMachine(() => createSwitchMachine(defaultChecked));
  const field = useFieldControl({ ...props, disabled });
  const on = checked ?? snapshot.state === 'on';

  return (
    <>
      <button
        {...props}
        type="button"
        role="switch"
        id={field.id}
        disabled={field.disabled}
        aria-checked={on}
        aria-describedby={field.describedBy}
        className={className ? `cuttle-focus ${className}` : 'cuttle-focus'}
        data-cuttle="switch"
        data-state={on ? 'on' : 'off'}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          send({ type: 'TOGGLE' });
          onCheckedChange?.(!on);
        }}
      >
        <span data-cuttle="switch-thumb" aria-hidden="true" />
      </button>
      {name && on ? <input type="hidden" name={name} value={value} /> : null}
    </>
  );
}
