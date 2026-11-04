import { Children, cloneElement, isValidElement, useState, useSyncExternalStore } from 'react';
import type { ComponentPropsWithRef, ElementType, ReactElement, ReactNode, Ref } from 'react';
import { mergeProps } from '@cuttle/core';
import type { Machine, MachineEvent, Snapshot } from '@cuttle/core';

/**
 * Binds a core machine to React. The factory runs once per component instance, and
 * the same snapshot is used on server and client, so this is safe during SSR.
 */
export function useMachine<C, E extends MachineEvent, S extends string>(
  factory: () => Machine<C, E, S>,
): [Snapshot<C, S>, Machine<C, E, S>['send'], Machine<C, E, S>] {
  const [machine] = useState(factory);
  const snapshot = useSyncExternalStore(machine.subscribe, machine.getSnapshot, machine.getSnapshot);
  return [snapshot, machine.send, machine];
}

/** Combines refs into a single callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (value: T | null) => void {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value);
      else if (ref) ref.current = value;
    }
  };
}

export interface SlotProps extends Record<string, unknown> {
  children?: ReactNode;
  ref?: Ref<unknown>;
}

/** Renders its only child with these props merged in. This powers `asChild`. */
export function Slot({ children, ref, ...props }: SlotProps) {
  const child = Children.only(children);
  if (!isValidElement(child)) {
    throw new Error('Slot expects a single React element as its child.');
  }
  const element = child as ReactElement<Record<string, unknown> & { ref?: Ref<unknown> }>;
  return cloneElement(element, {
    ...mergeProps<Record<string, unknown>>(props, element.props),
    ref: mergeRefs(ref, element.props.ref),
  });
}

/** Props for a component that renders as `E`, with its own props `P` taking priority. */
export type PolymorphicProps<E extends ElementType, P = object> = P & { as?: E } & Omit<
    ComponentPropsWithRef<E>,
    keyof P | 'as'
  >;

/** Props shared by parts that can hand their behavior to a child through `asChild`. */
export interface AsChildProps {
  asChild?: boolean;
}
