import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { createPopoverMachine, dismissableLayer, getTabbable, positioner } from '@cuttle-ui/core';
import type { Placement } from '@cuttle-ui/core';
import { Layer } from './layer';
import { mergeRefs, Slot, useMachine, usePresence } from './primitives';
import type { AsChildProps } from './primitives';

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
