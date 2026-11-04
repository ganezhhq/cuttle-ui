export type Orientation = 'horizontal' | 'vertical' | 'both';

export interface NextIndexOptions {
  key: string;
  current: number;
  count: number;
  orientation?: Orientation;
  loop?: boolean;
  dir?: 'ltr' | 'rtl';
  isDisabled?: (index: number) => boolean;
}

/** Maps a navigation key to the next enabled index. Returns null for other keys. */
export function getNextIndex(options: NextIndexOptions): number | null {
  const {
    key,
    current,
    count,
    orientation = 'vertical',
    loop = true,
    dir = 'ltr',
    isDisabled = () => false,
  } = options;
  if (count === 0) return null;

  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  const forwardKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

  let step: number;
  let start: number;
  if (key === 'Home') [start, step] = [0, 1];
  else if (key === 'End') [start, step] = [count - 1, -1];
  else if ((vertical && key === 'ArrowDown') || (horizontal && key === forwardKey))
    [start, step] = [current + 1, 1];
  else if ((vertical && key === 'ArrowUp') || (horizontal && key === backKey))
    [start, step] = [current - 1, -1];
  else return null;

  for (let i = 0, index = start; i < count; i += 1, index += step) {
    if (index < 0 || index >= count) {
      if (!loop) return current;
      index = (index + count) % count;
    }
    if (!isDisabled(index)) return index;
  }
  return current;
}

export interface RovingFocusOptions
  extends Omit<NextIndexOptions, 'key' | 'current' | 'count' | 'isDisabled'> {
  /** Selects the items inside the container. */
  selector: string;
}

/** Gives a container one tab stop and moves focus between its items with the keyboard. */
export function rovingFocus(container: HTMLElement, options: RovingFocusOptions): () => void {
  const { selector, ...rest } = options;
  const items = () => Array.from(container.querySelectorAll<HTMLElement>(selector));
  const isDisabled = (el?: HTMLElement) =>
    !el || el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

  const setActive = (active: HTMLElement | undefined) => {
    items().forEach((el) => (el.tabIndex = el === active ? 0 : -1));
  };

  const list = items();
  setActive(
    list.find((el) => el.tabIndex === 0 && !isDisabled(el)) ?? list.find((el) => !isDisabled(el)),
  );

  const onKeyDown = (event: KeyboardEvent) => {
    const all = items();
    const current = all.indexOf(event.target as HTMLElement);
    if (current === -1) return;
    const next = getNextIndex({
      ...rest,
      key: event.key,
      current,
      count: all.length,
      isDisabled: (index) => isDisabled(all[index]),
    });
    if (next === null) return;
    event.preventDefault();
    setActive(all[next]);
    all[next]?.focus();
  };

  const onFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (items().includes(target)) setActive(target);
  };

  container.addEventListener('keydown', onKeyDown);
  container.addEventListener('focusin', onFocusIn);
  return () => {
    container.removeEventListener('keydown', onKeyDown);
    container.removeEventListener('focusin', onFocusIn);
  };
}
