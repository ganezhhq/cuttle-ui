import type { ComponentPropsWithRef, ReactElement } from 'react';
import { useFieldControl } from './field';

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
