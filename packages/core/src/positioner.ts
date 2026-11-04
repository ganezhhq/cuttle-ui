import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { Placement, ReferenceElement } from '@floating-ui/dom';

export interface PositionerOptions {
  placement?: Placement;
  offset?: number;
  /** Padding kept between the floating element and the viewport edge. */
  padding?: number;
}

/**
 * Keeps a floating element anchored to a reference while either moves or resizes.
 * Sets `data-placement` so styles can react to the final side. Returns a cleanup.
 */
export function positioner(
  reference: ReferenceElement,
  floating: HTMLElement,
  options: PositionerOptions = {},
): () => void {
  const { placement = 'bottom', offset: gap = 8, padding = 8 } = options;
  floating.style.position = 'fixed';

  const update = () =>
    computePosition(reference, floating, {
      placement,
      strategy: 'fixed',
      middleware: [offset(gap), flip({ padding }), shift({ padding })],
    }).then((result) => {
      floating.style.left = `${result.x}px`;
      floating.style.top = `${result.y}px`;
      floating.dataset.placement = result.placement;
    });

  return autoUpdate(reference, floating, () => void update());
}
