import { createContext, useContext, useEffect, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement } from 'react';
import { getFieldDescribedBy, getFieldIds } from '@cuttle-ui/core';
import type { FieldIds } from '@cuttle-ui/core';

interface FieldContextValue {
  ids: FieldIds;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  hasLabel: boolean;
  describedBy: string | undefined;
  setHasLabel: (present: boolean) => void;
  setHasDescription: (present: boolean) => void;
  setHasError: (present: boolean) => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps extends ComponentPropsWithRef<'div'> {
  /** Marks the control as invalid and shows FieldError. */
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}

/** Connects a label, description and error to the control inside it. */
export function Field({
  invalid = false,
  disabled = false,
  required = false,
  ...props
}: FieldProps): ReactElement {
  const rootId = useId();
  const [hasLabel, setHasLabel] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);

  const value = useMemo<FieldContextValue>(() => {
    const ids = getFieldIds(rootId);
    return {
      ids,
      invalid,
      disabled,
      required,
      hasLabel,
      describedBy: getFieldDescribedBy(ids, { description: hasDescription, error: hasError }),
      setHasLabel,
      setHasDescription,
      setHasError,
    };
  }, [rootId, invalid, disabled, required, hasLabel, hasDescription, hasError]);

  return (
    <FieldContext.Provider value={value}>
      <div
        {...props}
        data-cuttle="field"
        data-invalid={invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
      />
    </FieldContext.Provider>
  );
}

export interface FieldControlOptions {
  id?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  invalid?: boolean | undefined;
  'aria-describedby'?: string | undefined;
}

export interface FieldControlProps {
  id: string | undefined;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  labelledBy: string | undefined;
  describedBy: string | undefined;
}

/** Combines a control's own props with those of the surrounding Field, if there is one. */
export function useFieldControl(options: FieldControlOptions): FieldControlProps {
  const field = useContext(FieldContext);
  return {
    id: options.id ?? field?.ids.control,
    disabled: options.disabled ?? field?.disabled ?? false,
    required: options.required ?? field?.required ?? false,
    invalid: options.invalid ?? field?.invalid ?? false,
    labelledBy: field?.hasLabel ? field.ids.label : undefined,
    describedBy: options['aria-describedby'] ?? field?.describedBy,
  };
}

export type LabelProps = ComponentPropsWithRef<'label'>;

/** A form label. Inside a Field, it finds its control by itself. */
export function Label({ htmlFor, id, ...props }: LabelProps): ReactElement {
  const field = useContext(FieldContext);
  const setHasLabel = field?.setHasLabel;
  useEffect(() => {
    setHasLabel?.(true);
    return () => setHasLabel?.(false);
  }, [setHasLabel]);
  return (
    <label
      {...props}
      id={id ?? field?.ids.label}
      htmlFor={htmlFor ?? field?.ids.control}
      data-cuttle="label"
      data-required={field?.required ? '' : undefined}
    />
  );
}

export type FieldDescriptionProps = ComponentPropsWithRef<'p'>;

/** Extra help for a control, connected through `aria-describedby`. */
export function FieldDescription(props: FieldDescriptionProps): ReactElement {
  const field = useContext(FieldContext);
  const setHasDescription = field?.setHasDescription;
  useEffect(() => {
    setHasDescription?.(true);
    return () => setHasDescription?.(false);
  }, [setHasDescription]);
  return <p {...props} id={field?.ids.description} data-cuttle="field-description" />;
}

export type FieldErrorProps = ComponentPropsWithRef<'p'>;

/** An error message. It only appears while the Field is invalid. */
export function FieldError(props: FieldErrorProps): ReactElement | null {
  const field = useContext(FieldContext);
  const setHasError = field?.setHasError;
  const shown = field?.invalid ?? true;
  useEffect(() => {
    if (!shown) return;
    setHasError?.(true);
    return () => setHasError?.(false);
  }, [shown, setHasError]);
  if (!shown) return null;
  return <p {...props} id={field?.ids.error} data-cuttle="field-error" />;
}
