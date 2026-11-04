import type { ComponentPropsWithRef, ReactElement } from 'react';
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
