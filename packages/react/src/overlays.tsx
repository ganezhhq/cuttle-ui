import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { createPortal } from 'react-dom';
import {
  createPopoverMachine,
  createSelectMachine,
  createTooltipMachine,
  createTypeahead,
  dismissableLayer,
  getNextIndex,
  getPortalContainer,
  getTabbable,
  positioner,
} from '@cuttle-ui/core';
import type { Placement } from '@floating-ui/dom';
import { useFieldControl } from './field';
import { LayerContainerContext, mergeRefs, Slot, useMachine, usePresence } from './primitives';
import type { AsChildProps } from './primitives';

export type { Placement };

/** Renders into the surrounding dialog if there is one, otherwise into the body. */
function Layer({ children }: { children: ReactNode }) {
  const parent = useContext(LayerContainerContext);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const container = parent ?? getPortalContainer();
  return container ? createPortal(children, container) : null;
}

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  trigger: HTMLElement | null;
  setTrigger: (element: HTMLElement | null) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(part: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) throw new Error(`${part} must be used inside Popover.`);
  return context;
}

export interface PopoverProps {
  children?: ReactNode;
  /** The open state, when you control it. */
  open?: boolean;
  /** The initial open state, when the popover controls itself. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Holds the state of a popover and connects its parts. */
export function Popover({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [snapshot, send] = useMachine(() => createPopoverMachine(defaultOpen));
  const contentId = useId();
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const open = openProp ?? snapshot.state === 'open';
  const value = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen: (next) => {
        if (next === open) return;
        send({ type: next ? 'OPEN' : 'CLOSE' });
        onOpenChange?.(next);
      },
      contentId,
      trigger,
      setTrigger,
    }),
    [open, send, onOpenChange, contentId, trigger],
  );
  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export type PopoverTriggerProps = ComponentPropsWithRef<'button'> & AsChildProps;

/** Toggles the popover when pressed. */
export function PopoverTrigger({ asChild = false, ref, onClick, ...props }: PopoverTriggerProps) {
  const { open, setOpen, contentId, setTrigger } = usePopoverContext('PopoverTrigger');
  const shared = {
    ...props,
    'data-cuttle': 'popover-trigger',
    'data-state': open ? 'open' : 'closed',
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'aria-controls': open ? contentId : undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
  };
  const mergedRef = mergeRefs<HTMLButtonElement>(ref, setTrigger);
  if (asChild) return <Slot {...shared} ref={mergedRef as Ref<unknown>} />;
  return <button type="button" {...shared} ref={mergedRef} />;
}

export interface PopoverContentProps extends ComponentPropsWithRef<'div'> {
  /** Where to place it. It flips when there is no room. Defaults to `bottom`. */
  placement?: Placement;
  /** The gap from the trigger, in pixels. Defaults to 8. */
  offset?: number;
}

/** The floating panel. Give it an `aria-label` or `aria-labelledby`. */
export function PopoverContent({
  placement = 'bottom',
  offset = 8,
  ref,
  children,
  ...props
}: PopoverContentProps) {
  const { open, setOpen, contentId, trigger } = usePopoverContext('PopoverContent');
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const present = usePresence(open, node);
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    if (!node || !trigger || !present) return;
    return positioner(trigger, node, { placement, offset });
  }, [node, trigger, present, placement, offset]);

  useEffect(() => {
    if (!open || !node) return;
    (getTabbable(node)[0] ?? node).focus();
    return dismissableLayer(node, {
      exclude: [trigger],
      onDismiss: (reason) => {
        setOpenRef.current(false);
        if (reason === 'escape') trigger?.focus();
      },
    });
  }, [open, node, trigger]);

  if (!present) return null;

  return (
    <Layer>
      <div
        {...props}
        ref={mergeRefs<HTMLDivElement>(ref, setNode)}
        id={contentId}
        role="dialog"
        tabIndex={-1}
        data-cuttle="popover-content"
        data-state={open ? 'open' : 'closed'}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          props.onKeyDown?.(event);
          if (event.key !== 'Tab' || event.defaultPrevented || !node) return;
          // The panel sits at the end of the page, so leaving it returns to the trigger.
          const items = getTabbable(node);
          const edge = event.shiftKey ? items[0] : items[items.length - 1];
          const active = document.activeElement;
          if (items.length === 0 || active === edge || (event.shiftKey && active === node)) {
            event.preventDefault();
            setOpen(false);
            trigger?.focus();
          }
        }}
      >
        {children}
      </div>
    </Layer>
  );
}

export type PopoverCloseProps = ComponentPropsWithRef<'button'> & AsChildProps;

/** Closes the popover and returns focus to the trigger. */
export function PopoverClose({ asChild = false, onClick, ...props }: PopoverCloseProps) {
  const { setOpen, trigger } = usePopoverContext('PopoverClose');
  const shared = {
    ...props,
    'data-cuttle': 'popover-close',
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setOpen(false);
      trigger?.focus();
    },
  };
  return asChild ? <Slot {...shared} /> : <button type="button" {...shared} />;
}

interface TooltipContextValue {
  open: boolean;
  show: () => void;
  hide: () => void;
  dismiss: () => void;
  contentId: string;
  trigger: HTMLElement | null;
  setTrigger: (element: HTMLElement | null) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(part: string): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) throw new Error(`${part} must be used inside Tooltip.`);
  return context;
}

export interface TooltipProps {
  children?: ReactNode;
  /** Milliseconds to wait before showing. Defaults to 300. */
  openDelay?: number;
  /** Milliseconds to wait before hiding. Defaults to 100. */
  closeDelay?: number;
}

/** Holds the state of a tooltip and connects its parts. */
export function Tooltip({ children, openDelay, closeDelay }: TooltipProps) {
  const [snapshot, send] = useMachine(() =>
    createTooltipMachine({
      ...(openDelay === undefined ? {} : { openDelay }),
      ...(closeDelay === undefined ? {} : { closeDelay }),
    }),
  );
  const contentId = useId();
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const open = snapshot.state === 'open' || snapshot.state === 'closing';

  useEffect(() => () => send({ type: 'DISMISS' }), [send]);

  const value = useMemo<TooltipContextValue>(
    () => ({
      open,
      show: () => send({ type: 'SHOW' }),
      hide: () => send({ type: 'HIDE' }),
      dismiss: () => send({ type: 'DISMISS' }),
      contentId,
      trigger,
      setTrigger,
    }),
    [open, send, contentId, trigger],
  );
  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

export type TooltipTriggerProps = ComponentPropsWithRef<'button'> & AsChildProps;

/** The element the tooltip describes. It must be focusable. */
export function TooltipTrigger({ asChild = false, ref, ...props }: TooltipTriggerProps) {
  const { open, show, hide, dismiss, contentId, setTrigger } = useTooltipContext('TooltipTrigger');
  const shared = {
    ...props,
    'data-cuttle': 'tooltip-trigger',
    'data-state': open ? 'open' : 'closed',
    'aria-describedby': open ? contentId : props['aria-describedby'],
    onPointerEnter: (event: PointerEvent<HTMLButtonElement>) => {
      props.onPointerEnter?.(event);
      if (event.pointerType !== 'touch') show();
    },
    onPointerLeave: (event: PointerEvent<HTMLButtonElement>) => {
      props.onPointerLeave?.(event);
      hide();
    },
    onFocus: (event: FocusEvent<HTMLButtonElement>) => {
      props.onFocus?.(event);
      show();
    },
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      props.onBlur?.(event);
      dismiss();
    },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      dismiss();
    },
  };
  const mergedRef = mergeRefs<HTMLButtonElement>(ref, setTrigger);
  if (asChild) return <Slot {...shared} ref={mergedRef as Ref<unknown>} />;
  return <button type="button" {...shared} ref={mergedRef} />;
}

export interface TooltipContentProps extends ComponentPropsWithRef<'div'> {
  /** Where to place it. It flips when there is no room. Defaults to `top`. */
  placement?: Placement;
  /** The gap from the trigger, in pixels. Defaults to 6. */
  offset?: number;
}

/** The floating text. It stays open while the pointer is over it. */
export function TooltipContent({
  placement = 'top',
  offset = 6,
  ref,
  ...props
}: TooltipContentProps) {
  const { open, show, hide, dismiss, contentId, trigger } = useTooltipContext('TooltipContent');
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const present = usePresence(open, node);

  useEffect(() => {
    if (!node || !trigger || !present) return;
    return positioner(trigger, node, { placement, offset });
  }, [node, trigger, present, placement, offset]);

  useEffect(() => {
    if (!open || !node) return;
    return dismissableLayer(node, { onDismiss: dismiss, closeOnOutsidePointer: false });
  }, [open, node, dismiss]);

  if (!present) return null;

  return (
    <Layer>
      <div
        {...props}
        ref={mergeRefs<HTMLDivElement>(ref, setNode)}
        id={contentId}
        role="tooltip"
        data-cuttle="tooltip-content"
        data-state={open ? 'open' : 'closed'}
        onPointerEnter={(event) => {
          props.onPointerEnter?.(event);
          show();
        }}
        onPointerLeave={(event) => {
          props.onPointerLeave?.(event);
          hide();
        }}
      />
    </Layer>
  );
}

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
