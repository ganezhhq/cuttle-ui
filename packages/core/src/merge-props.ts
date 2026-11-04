type AnyHandler = (event: { defaultPrevented?: boolean }) => void;
type Props = Record<string, unknown>;

/** Runs `first`, then runs `second` unless the event was default-prevented. */
export function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  first: ((event: E) => void) | undefined,
  second: ((event: E) => void) | undefined,
): (event: E) => void {
  return (event) => {
    first?.(event);
    if (!event.defaultPrevented) second?.(event);
  };
}

const isHandlerName = (key: string) => /^on[A-Z]/.test(key);
const isObject = (value: unknown): value is Props => typeof value === 'object' && value !== null;

/**
 * Merges props where later objects win. Class names join, styles merge, and event
 * handlers compose: the later (more specific) handler runs first and can cancel
 * earlier ones with preventDefault().
 */
export function mergeProps<T extends Props>(...sources: Array<T | null | undefined>): T {
  const result: Props = {};
  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      const existing = result[key];
      if (isHandlerName(key) && typeof value === 'function' && typeof existing === 'function') {
        result[key] = composeEventHandlers(value as AnyHandler, existing as AnyHandler);
      } else if ((key === 'className' || key === 'class') && existing && value) {
        result[key] = `${String(existing)} ${String(value)}`;
      } else if (key === 'style' && isObject(existing) && isObject(value)) {
        result[key] = { ...existing, ...value };
      } else if (value !== undefined) {
        result[key] = value;
      }
    }
  }
  return result as T;
}
