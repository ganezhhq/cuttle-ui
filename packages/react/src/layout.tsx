import type { ComponentPropsWithRef, CSSProperties, ElementType, ReactElement } from 'react';
import { Slot } from './primitives';
import type { AsChildProps } from './primitives';

export interface CardProps extends ComponentPropsWithRef<'div'>, AsChildProps {
  /** Uses the tinted surface. Turn it off for a plain background. Defaults to true. */
  tinted?: boolean;
}

/** A grouped surface. */
export function Card({ asChild = false, tinted = true, ...props }: CardProps): ReactElement {
  const shared = { ...props, 'data-cuttle': 'card', 'data-tinted': tinted ? '' : undefined };
  return asChild ? <Slot {...shared} /> : <div {...shared} />;
}

export type CardPartProps = ComponentPropsWithRef<'div'>;

/** The top of a Card, usually a heading. */
export function CardHeader(props: CardPartProps): ReactElement {
  return <div {...props} data-cuttle="card-header" />;
}

/** The main content of a Card. */
export function CardContent(props: CardPartProps): ReactElement {
  return <div {...props} data-cuttle="card-content" />;
}

/** The bottom of a Card, usually actions. */
export function CardFooter(props: CardPartProps): ReactElement {
  return <div {...props} data-cuttle="card-footer" />;
}

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
