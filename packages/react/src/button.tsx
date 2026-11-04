import type { ComponentPropsWithRef, MouseEvent, ReactElement } from 'react';
import { Slot } from './primitives';
import type { AsChildProps } from './primitives';

export type ButtonVariant = 'solid' | 'outline' | 'soft' | 'ghost' | 'link' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'>, AsChildProps {
  /** Visual style. Defaults to `solid`. */
  variant?: ButtonVariant;
  /** Defaults to `md`. */
  size?: ButtonSize;
  /** Shows a spinner and ignores presses, while staying focusable. */
  loading?: boolean;
}

/** An action button. With `asChild`, it styles its only child, such as a link. */
export function Button({
  asChild = false,
  variant = 'solid',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  onClickCapture,
  ...props
}: ButtonProps): ReactElement {
  // A link cannot use the disabled attribute, so it is blocked here instead.
  const blocked = loading || (asChild && disabled);

  const shared = {
    ...props,
    'data-cuttle': 'button',
    'data-variant': variant,
    'data-size': size,
    'data-loading': loading ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'aria-busy': loading || undefined,
    'aria-disabled': blocked || props['aria-disabled'],
    className: className ? `cuttle-focus ${className}` : 'cuttle-focus',
    // Runs in the capture phase, so it also stops an onClick on the asChild element.
    onClickCapture: (event: MouseEvent<HTMLButtonElement>) => {
      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClickCapture?.(event);
    },
  };

  if (asChild) {
    return <Slot {...shared} tabIndex={disabled ? -1 : props.tabIndex} />;
  }
  return <button {...shared} type={type} disabled={disabled} />;
}
