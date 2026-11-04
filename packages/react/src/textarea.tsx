import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement } from 'react';
import { autoResize } from '@cuttle-ui/core';
import { useFieldControl } from './field';
import { mergeRefs } from './primitives';

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
