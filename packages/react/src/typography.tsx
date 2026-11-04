import type { ComponentPropsWithRef, ElementType, ReactElement } from 'react';
import { Slot } from './primitives';
import type { AsChildProps } from './primitives';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface HeadingProps extends ComponentPropsWithRef<'h2'> {
  /** The heading level in the page outline. Defaults to 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The visual size, when it should differ from the level. */
  size?: TextSize;
}

const headingSizes: Record<number, TextSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
};

/** A heading. Its level and its visual size can be set separately. */
export function Heading({ level = 2, size, ...props }: HeadingProps): ReactElement {
  const Tag = `h${level}` as ElementType;
  return <Tag {...props} data-cuttle="heading" data-size={size ?? headingSizes[level]} />;
}

export interface TextProps extends ComponentPropsWithRef<'p'>, AsChildProps {
  /** Defaults to `md`. */
  size?: TextSize;
  /** Uses the muted text color. */
  muted?: boolean;
}

/** Body text. Use `asChild` to render a different element. */
export function Text({
  asChild = false,
  size = 'md',
  muted = false,
  ...props
}: TextProps): ReactElement {
  const shared = {
    ...props,
    'data-cuttle': 'text',
    'data-size': size,
    'data-muted': muted ? '' : undefined,
  };
  return asChild ? <Slot {...shared} /> : <p {...shared} />;
}

export type CodeProps = ComponentPropsWithRef<'code'>;

/** Inline code. */
export function Code(props: CodeProps): ReactElement {
  return <code {...props} data-cuttle="code" />;
}
