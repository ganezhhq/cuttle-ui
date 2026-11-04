import { createContext, useContext, useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { createRadioGroupMachine } from '@cuttle-ui/core';
import { useFieldControl } from './field';
import { useMachine } from './primitives';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  select: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange'
> {
  /** The selected value, when you control it. */
  value?: string;
  /** The initial value, when the group controls itself. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The form field name. Defaults to a generated one. */
  name?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}

/** A set of options where one can be chosen. The native radios provide the arrow keys. */
export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  orientation = 'vertical',
  disabled,
  required,
  invalid,
  ...props
}: RadioGroupProps): ReactElement {
  const [snapshot, send] = useMachine(() => createRadioGroupMachine(defaultValue));
  const generated = useId();
  const field = useFieldControl({ ...props, disabled, required, invalid });
  const current = value ?? snapshot.context.value;

  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? generated,
        value: current,
        disabled: field.disabled,
        required: field.required,
        invalid: field.invalid,
        select: (next) => {
          send({ type: 'SELECT', value: next });
          onValueChange?.(next);
        },
      }}
    >
      <div
        {...props}
        id={field.id}
        role="radiogroup"
        aria-labelledby={props['aria-labelledby'] ?? field.labelledBy}
        aria-describedby={field.describedBy}
        aria-required={field.required || undefined}
        aria-invalid={field.invalid || undefined}
        aria-disabled={field.disabled || undefined}
        data-cuttle="radio-group"
        data-orientation={orientation}
      />
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'value' | 'size'
> {
  value: string;
  /** The label, shown next to the circle. */
  children?: ReactNode;
}

/** One option in a RadioGroup. */
export function Radio({
  value,
  children,
  className,
  disabled,
  onChange,
  ...props
}: RadioProps): ReactElement {
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error('Radio must be used inside RadioGroup.');
  const off = disabled ?? group.disabled;
  const checked = group.value === value;
  return (
    <label
      className={className}
      data-cuttle="radio"
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={off ? '' : undefined}
    >
      <span data-cuttle="radio-box">
        <input
          {...props}
          type="radio"
          name={group.name}
          value={value}
          checked={checked}
          disabled={off}
          required={group.required}
          onChange={(event) => {
            onChange?.(event);
            group.select(value);
          }}
        />
        <span data-cuttle="radio-dot" aria-hidden="true" />
      </span>
      {children}
    </label>
  );
}
