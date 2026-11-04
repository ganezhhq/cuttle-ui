import type { ComponentPropsWithRef, CSSProperties, ReactElement } from 'react';
import { Slot } from './primitives';
import type { AsChildProps } from './primitives';

export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StackProps extends ComponentPropsWithRef<'div'>, AsChildProps {
  /** Defaults to `column`. */
  direction?: 'row' | 'column';
  /** A step on the spacing scale. Defaults to 3. */
  gap?: StackGap;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
}

/** Lays out its children in a row or column with even spacing. */
export function Stack({
  asChild = false,
  direction = 'column',
  gap = 3,
  align,
  justify,
  wrap = false,
  style,
  ...props
}: StackProps): ReactElement {
  const shared = {
    ...props,
    'data-cuttle': 'stack',
    'data-direction': direction,
    'data-align': align,
    'data-justify': justify,
    'data-wrap': wrap ? '' : undefined,
    style: {
      ...style,
      gap: gap === 0 ? 0 : `var(--cuttle-space-${gap})`,
    } satisfies CSSProperties,
  };
  return asChild ? <Slot {...shared} /> : <div {...shared} />;
}
