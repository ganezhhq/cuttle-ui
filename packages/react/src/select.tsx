import { useEffect, useId, useState } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent, ReactElement } from 'react';
import {
  createSelectMachine,
  createTypeahead,
  dismissableLayer,
  getNextIndex,
  positioner,
} from '@cuttle-ui/core';
import type { Placement } from '@cuttle-ui/core';
import { useFieldControl } from './field';
import { Layer } from './layer';
import { mergeRefs, useMachine, usePresence } from './primitives';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  options: readonly SelectOption[];
  /** The selected value, when you control it. */
  value?: string;
  /** The initial value, when the select controls itself. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shown while nothing is selected. */
  placeholder?: string;
  /** Adds a hidden input, so the value is sent with a form. */
  name?: string;
  invalid?: boolean;
  /** Where to place the list. It flips when there is no room. Defaults to `bottom-start`. */
  placement?: Placement;
}

const OPEN_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End']);

/** A select-only combobox. Focus stays on the trigger while the list is open. */
export function Select({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = 'Select',
  name,
  invalid,
  placement = 'bottom-start',
  disabled,
  className,
  ref,
  onClick,
  onKeyDown,
  onBlur,
  ...props
}: SelectProps): ReactElement {
  const [snapshot, send] = useMachine(() => createSelectMachine(defaultValue));
  const field = useFieldControl({ ...props, disabled, invalid });
  const rootId = useId();
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const [typeahead] = useState(() => createTypeahead());

  const open = snapshot.state === 'open';
  const value = valueProp ?? snapshot.context.value;
  const highlighted = snapshot.context.highlighted;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];
  const present = usePresence(open, list);
  const listId = `${rootId}-list`;
  const optionId = (index: number) => `${rootId}-option-${index}`;
  const labels = options.map((option) => (option.disabled ? '' : option.label));
  const isDisabled = (index: number) => options[index]?.disabled === true;
  const firstEnabled = options.findIndex((option) => !option.disabled);

  const commit = (next: SelectOption) => {
    send({ type: 'SELECT', value: next.value });
    if (next.value !== value) onValueChange?.(next.value);
  };

  useEffect(() => {
    if (!list || !trigger || !present) return;
    list.style.minWidth = `${trigger.offsetWidth}px`;
    return positioner(trigger, list, { placement, offset: 4 });
  }, [list, trigger, present, placement]);

  useEffect(() => {
    if (!open || !list) return;
    return dismissableLayer(list, {
      exclude: [trigger],
      onDismiss: () => send({ type: 'CLOSE' }),
    });
  }, [open, list, trigger, send]);

  useEffect(() => {
    if (!open || !list || highlighted < 0) return;
    list.children[highlighted]?.scrollIntoView?.({ block: 'nearest' });
  }, [open, list, highlighted]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const { key } = event;

    if (!open) {
      if (OPEN_KEYS.has(key)) {
        event.preventDefault();
        const start = selectedIndex >= 0 ? selectedIndex : firstEnabled;
        if (key === 'Home' || key === 'End') {
          const edge = getNextIndex({ key, current: start, count: options.length, isDisabled });
          send({ type: 'OPEN', highlighted: edge ?? start });
        } else {
          send({ type: 'OPEN', highlighted: start });
        }
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const match = typeahead(key, labels, selectedIndex);
        if (match >= 0) send({ type: 'OPEN', highlighted: match });
      }
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const option = options[highlighted];
      if (option && !option.disabled) commit(option);
      else send({ type: 'CLOSE' });
    } else if (key === 'Tab') {
      const option = options[highlighted];
      if (option && !option.disabled) commit(option);
      else send({ type: 'CLOSE' });
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      const next = getNextIndex({
        key,
        current: highlighted,
        count: options.length,
        loop: false,
        isDisabled,
      });
      if (next !== null) send({ type: 'HIGHLIGHT', index: next });
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const match = typeahead(key, labels, highlighted);
      if (match >= 0) send({ type: 'HIGHLIGHT', index: match });
    }
  };

  return (
    <>
      <button
        {...props}
        ref={mergeRefs<HTMLButtonElement>(ref, setTrigger)}
        type="button"
        id={field.id}
        role="combobox"
        disabled={field.disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && highlighted >= 0 ? optionId(highlighted) : undefined}
        aria-labelledby={props['aria-labelledby'] ?? field.labelledBy}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        className={className ? `cuttle-focus ${className}` : 'cuttle-focus'}
        data-cuttle="select-trigger"
        data-state={open ? 'open' : 'closed'}
        data-invalid={field.invalid ? '' : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (open) send({ type: 'CLOSE' });
          else
            send({ type: 'OPEN', highlighted: selectedIndex >= 0 ? selectedIndex : firstEnabled });
        }}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          onBlur?.(event);
          if (open) send({ type: 'CLOSE' });
        }}
      >
        <span data-cuttle="select-value" data-placeholder={selected ? undefined : ''}>
          {selected?.label ?? placeholder}
        </span>
        <svg data-cuttle="select-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}
      {present ? (
        <Layer>
          <ul
            ref={setList}
            id={listId}
            role="listbox"
            aria-labelledby={props['aria-labelledby'] ?? field.labelledBy}
            aria-label={props['aria-label']}
            data-cuttle="select-list"
            data-state={open ? 'open' : 'closed'}
            // Keeps focus on the trigger when an option is pressed.
            onMouseDown={(event) => event.preventDefault()}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                data-cuttle="select-option"
                data-highlighted={index === highlighted ? '' : undefined}
                onPointerMove={() => {
                  if (!option.disabled && index !== highlighted) {
                    send({ type: 'HIGHLIGHT', index });
                  }
                }}
                onClick={() => {
                  if (!option.disabled) commit(option);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </Layer>
      ) : null}
    </>
  );
}
