import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactNode, Ref, RefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  createDialogMachine,
  createId,
  dismissableLayer,
  focusTrap,
  getPortalContainer,
  lockScroll,
} from '@cuttle-ui/core';
import { LayerContainerContext, mergeRefs, Slot, useMachine, usePresence } from './primitives';
import type { AsChildProps } from './primitives';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  rootId: string;
  triggerRef: RefObject<HTMLElement | null>;
  hasTitle: boolean;
  setHasTitle: (present: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (present: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(part: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error(`${part} must be used inside Dialog.`);
  return context;
}

export interface DialogProps {
  children?: ReactNode;
  /** The open state, when you control it. */
  open?: boolean;
  /** The initial open state, when the dialog controls itself. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Holds the state of a modal dialog and connects its parts. */
export function Dialog({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) {
  const [snapshot, send] = useMachine(() => createDialogMachine(defaultOpen));
  const rootId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const open = openProp ?? snapshot.state === 'open';

  const value = useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen: (next) => {
        if (next === open) return;
        send({ type: next ? 'OPEN' : 'CLOSE' });
        onOpenChange?.(next);
      },
      rootId,
      triggerRef,
      hasTitle,
      setHasTitle,
      hasDescription,
      setHasDescription,
    }),
    [open, send, onOpenChange, rootId, hasTitle, hasDescription],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export type DialogTriggerProps = ComponentPropsWithRef<'button'> & AsChildProps;

/** Opens the dialog when pressed. */
export function DialogTrigger({ asChild = false, ref, onClick, ...props }: DialogTriggerProps) {
  const { open, setOpen, rootId, triggerRef } = useDialogContext('DialogTrigger');
  const shared = {
    ...props,
    'data-cuttle': 'dialog-trigger',
    'data-state': open ? 'open' : 'closed',
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'aria-controls': open ? createId(rootId, 'content') : undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(true);
    },
  };
  const mergedRef = mergeRefs<HTMLButtonElement>(ref, triggerRef as RefObject<HTMLButtonElement>);
  if (asChild) return <Slot {...shared} ref={mergedRef as Ref<unknown>} />;
  return <button type="button" {...shared} ref={mergedRef} />;
}

export interface DialogContentProps extends ComponentPropsWithRef<'div'> {
  /** Closes the dialog when Esc is pressed. Defaults to true. */
  closeOnEscape?: boolean;
  /** Closes the dialog when the area outside it is pressed. Defaults to true. */
  closeOnOutsidePress?: boolean;
  /** The element to focus on opening. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/** The modal panel and its overlay, rendered in a portal. */
export function DialogContent({
  children,
  ref,
  closeOnEscape = true,
  closeOnOutsidePress = true,
  initialFocusRef,
  ...props
}: DialogContentProps) {
  const { open, setOpen, rootId, hasTitle, hasDescription } = useDialogContext('DialogContent');
  const parentContent = useContext(LayerContainerContext);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const present = usePresence(open, node);

  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  // Portals need the document, so nothing renders until the client has taken over.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !node) return;
    const unlock = lockScroll();
    const releaseLayer = dismissableLayer(node, {
      onDismiss: () => setOpenRef.current(false),
      closeOnEscape,
      closeOnOutsidePointer: closeOnOutsidePress,
    });
    const releaseTrap = focusTrap(node, { initialFocus: initialFocusRef?.current });
    return () => {
      releaseTrap();
      releaseLayer();
      unlock();
    };
  }, [open, node, closeOnEscape, closeOnOutsidePress, initialFocusRef]);

  if (!mounted || !present) return null;

  const state = open ? 'open' : 'closed';
  const container = parentContent ?? getPortalContainer();
  if (!container) return null;

  return createPortal(
    <>
      <div data-cuttle="dialog-overlay" data-state={state} aria-hidden="true" />
      <LayerContainerContext.Provider value={node}>
        <div
          {...props}
          ref={mergeRefs<HTMLDivElement>(ref, setNode)}
          id={createId(rootId, 'content')}
          role="dialog"
          aria-modal="true"
          aria-labelledby={hasTitle ? createId(rootId, 'title') : props['aria-labelledby']}
          aria-describedby={
            hasDescription ? createId(rootId, 'description') : props['aria-describedby']
          }
          tabIndex={-1}
          data-cuttle="dialog-content"
          data-state={state}
        >
          {children}
        </div>
      </LayerContainerContext.Provider>
    </>,
    container,
  );
}

export type DialogTitleProps = ComponentPropsWithRef<'h2'>;

/** Names the dialog for assistive technology. Every dialog needs one. */
export function DialogTitle(props: DialogTitleProps) {
  const { rootId, setHasTitle } = useDialogContext('DialogTitle');
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return <h2 {...props} id={createId(rootId, 'title')} data-cuttle="dialog-title" />;
}

export type DialogDescriptionProps = ComponentPropsWithRef<'p'>;

/** Describes the dialog for assistive technology. */
export function DialogDescription(props: DialogDescriptionProps) {
  const { rootId, setHasDescription } = useDialogContext('DialogDescription');
  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);
  return <p {...props} id={createId(rootId, 'description')} data-cuttle="dialog-description" />;
}

export type DialogCloseProps = ComponentPropsWithRef<'button'> & AsChildProps;

/** Closes the dialog when pressed. */
export function DialogClose({ asChild = false, onClick, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext('DialogClose');
  const shared = {
    ...props,
    'data-cuttle': 'dialog-close',
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(false);
    },
  };
  if (asChild) return <Slot {...shared} />;
  return <button type="button" {...shared} />;
}
