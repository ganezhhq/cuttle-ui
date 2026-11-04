export type IdFactory = (suffix?: string) => string;

/**
 * Creates a deterministic ID sequence. Create one factory per render or request
 * so server and client produce the same IDs. Never use a shared global counter
 * on a server, because it would keep growing across requests.
 */
export function createIdFactory(prefix = 'cuttle'): IdFactory {
  let count = 0;
  return (suffix) => {
    count += 1;
    return suffix ? `${prefix}-${count}-${suffix}` : `${prefix}-${count}`;
  };
}

/** Derives a stable part ID from a root ID, for example `abc-trigger`. */
export function createId(rootId: string, part?: string): string {
  return part ? `${rootId}-${part}` : rootId;
}
