export type PortalTarget = HTMLElement | string | null | undefined;

/** Resolves a portal target, defaulting to document.body. Returns null during SSR. */
export function getPortalContainer(target?: PortalTarget): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  return target ?? document.body;
}

/** Moves an element into a container. Returns a function that removes it again. */
export function portal(element: HTMLElement, target?: PortalTarget): () => void {
  getPortalContainer(target)?.appendChild(element);
  return () => element.remove();
}
