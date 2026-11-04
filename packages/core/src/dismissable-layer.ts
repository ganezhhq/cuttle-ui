export interface DismissableLayerOptions {
  onDismiss: (reason: 'escape' | 'outside') => void;
  /** Elements that do not count as outside, such as the trigger. */
  exclude?: Array<HTMLElement | null | undefined>;
  closeOnEscape?: boolean;
  closeOnOutsidePointer?: boolean;
}

const stack: HTMLElement[] = [];

/** Dismisses on Esc or outside press. Only the topmost open layer reacts. */
export function dismissableLayer(
  element: HTMLElement,
  options: DismissableLayerOptions,
): () => void {
  const { onDismiss, exclude = [], closeOnEscape = true, closeOnOutsidePointer = true } = options;
  stack.push(element);
  const isTop = () => stack[stack.length - 1] === element;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape && isTop()) {
      event.stopImmediatePropagation();
      onDismiss('escape');
    }
  };

  const onPointerDown = (event: Event) => {
    if (!closeOnOutsidePointer || !isTop()) return;
    const target = event.target as Node;
    if (element.contains(target) || exclude.some((el) => el?.contains(target))) return;
    onDismiss('outside');
  };

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);

  return () => {
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    const index = stack.lastIndexOf(element);
    if (index !== -1) stack.splice(index, 1);
  };
}
