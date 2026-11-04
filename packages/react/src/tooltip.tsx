import { createContext, useContext, useEffect, useId, useMemo, useState } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  Ref,
} from 'react';
import { createTooltipMachine, dismissableLayer, positioner } from '@cuttle-ui/core';
import type { Placement } from '@cuttle-ui/core';
import { Layer } from './layer';
import { mergeRefs, Slot, useMachine, usePresence } from './primitives';
import type { AsChildProps } from './primitives';

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
