import { createContext, useContext, useEffect, useId, useRef } from 'react';
import type { ChangeEvent, ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import {
  autoResize,
  createCheckboxMachine,
  createRadioGroupMachine,
  createSwitchMachine,
  toCheckedState,
} from '@cuttle-ui/core';
import type { CheckedState } from '@cuttle-ui/core';
import { useFieldControl } from './field';
import { mergeRefs, useMachine } from './primitives';

export type ControlSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  /** Defaults to `md`. */
  size?: ControlSize;
  invalid?: boolean;
}

/** A single-line text input. */
export function Input({ size = 'md', invalid, className, ...props }: InputProps): ReactElement {
  const field = useFieldControl({ ...props, invalid });
  return (
    <input
      {...props}
      id={field.id}
      disabled={field.disabled}
      required={field.required}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      className={className ? `cuttle-focus ${className}` : 'cuttle-focus'}
      data-cuttle="input"
      data-size={size}
      data-invalid={field.invalid ? '' : undefined}
    />
  );
}

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  invalid?: boolean;
  /** Grows with the text instead of scrolling. */
  autoResize?: boolean;
}

/** A multi-line text input. */
export function Textarea({
  invalid,
  autoResize: resize = false,
  className,
  ref,
  value,
  ...props
}: TextareaProps): ReactElement {
  const field = useFieldControl({ ...props, invalid });
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const controller = useRef<ReturnType<typeof autoResize> | null>(null);

  useEffect(() => {
    if (!resize || !inner.current) return;
    controller.current = autoResize(inner.current);
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, [resize]);

  // A controlled value can change without an input event.
  useEffect(() => {
    controller.current?.update();
  }, [value]);

  return (
    <textarea
      {...props}
      value={value}
      ref={mergeRefs(ref, inner)}
      id={field.id}
      disabled={field.disabled}
      required={field.required}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      className={className ? `cuttle-focus ${className}` : 'cuttle-focus'}
      data-cuttle="textarea"
      data-auto-resize={resize ? '' : undefined}
      data-invalid={field.invalid ? '' : undefined}
    />
  );
}

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
