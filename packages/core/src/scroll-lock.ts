let locks = 0;
let restore: (() => void) | undefined;

/** Locks page scroll. Nested locks are counted, so scroll returns after the last unlock. */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (locks === 0) {
    const { documentElement: root, body } = document;
    const { overflow, paddingRight } = body.style;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    restore = () => {
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
    };
  }
  locks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      restore?.();
      restore = undefined;
    }
  };
}
