import { useEffect, useRef } from 'react';
import type { ChangeEvent, ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { createCheckboxMachine, toCheckedState } from '@cuttle-ui/core';
import type { CheckedState } from '@cuttle-ui/core';
import { useFieldControl } from './field';
import { mergeRefs, useMachine } from './primitives';

export interface CheckboxProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'checked' | 'defaultChecked' | 'size'
> {
  /** The checked state, when you control it. */
  checked?: CheckedState;
  /** The initial state, when the checkbox controls itself. */
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  invalid?: boolean;
  /** The label, shown next to the box. */
  children?: ReactNode;
}

/** A checkbox built on the native input, with an indeterminate state. */
export function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  invalid,
  children,
  className,
  ref,
  ...props
}: CheckboxProps): ReactElement {
  const [snapshot, send] = useMachine(() => createCheckboxMachine(defaultChecked));
  const field = useFieldControl({ ...props, invalid });
  const inner = useRef<HTMLInputElement | null>(null);
  const state = checked ?? toCheckedState(snapshot.state);
  const dataState = state === 'indeterminate' ? state : state ? 'checked' : 'unchecked';

  useEffect(() => {
    if (inner.current) inner.current.indeterminate = state === 'indeterminate';
  }, [state]);

  return (
    <label
      className={className}
      data-cuttle="checkbox"
      data-state={dataState}
      data-disabled={field.disabled ? '' : undefined}
      data-invalid={field.invalid ? '' : undefined}
    >
      <span data-cuttle="checkbox-box">
        <input
          {...props}
          ref={mergeRefs(ref, inner)}
          type="checkbox"
          id={field.id}
          disabled={field.disabled}
          required={field.required}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          checked={state === true}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange?.(event);
            send({ type: 'TOGGLE' });
            onCheckedChange?.(state === 'indeterminate' ? true : event.target.checked);
          }}
        />
        <svg data-cuttle="checkbox-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d={state === 'indeterminate' ? 'M4 8h8' : 'm3.5 8.5 3 3 6-7'} />
        </svg>
      </span>
      {children}
    </label>
  );
}
