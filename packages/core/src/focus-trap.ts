const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** Returns tabbable descendants in DOM order, skipping hidden and inert content. */
export function getTabbable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.tabIndex < 0 || el.closest('[hidden], [inert]')) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null;
  /** Returns focus to the previously focused element on release. Defaults to true. */
  returnFocus?: boolean;
}

/** Keeps Tab focus inside a container. Returns a function that releases the trap. */
export function focusTrap(container: HTMLElement, options: FocusTrapOptions = {}): () => void {
  const { initialFocus, returnFocus = true } = options;
  const previous = document.activeElement as HTMLElement | null;

  if (!container.hasAttribute('tabindex') && getTabbable(container).length === 0) {
    container.tabIndex = -1;
  }
  (initialFocus ?? getTabbable(container)[0] ?? container).focus();

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const items = getTabbable(container);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    if (!container.contains(event.target as Node)) {
      (getTabbable(container)[0] ?? container).focus();
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('focusin', onFocusIn);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('focusin', onFocusIn);
    if (returnFocus) previous?.focus?.();
  };
}
