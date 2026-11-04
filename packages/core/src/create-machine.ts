export interface MachineEvent {
  type: string;
}

export interface Transition<C, E extends MachineEvent, S extends string> {
  target?: S;
  guard?: (context: C, event: E) => boolean;
  /** Returns the next context. Omit to keep the current one. */
  update?: (context: C, event: E) => C;
}

export interface StateConfig<C, E extends MachineEvent, S extends string> {
  on?: { [K in E['type']]?: S | Transition<C, Extract<E, { type: K }>, S> };
  entry?: (context: C) => void;
  exit?: (context: C) => void;
}

export interface MachineConfig<C, E extends MachineEvent, S extends string> {
  initial: S;
  context: C;
  states: Record<S, StateConfig<C, E, S>>;
}

export interface Snapshot<C, S extends string> {
  state: S;
  context: C;
}

export interface Machine<C, E extends MachineEvent, S extends string> {
  /** Returns the same object until something changes, as useSyncExternalStore requires. */
  getSnapshot(): Snapshot<C, S>;
  send(event: E): void;
  subscribe(listener: (snapshot: Snapshot<C, S>) => void): () => void;
  matches(...states: S[]): boolean;
}

/** A tiny finite state machine with a context value and a subscribe API. */
export function createMachine<C, E extends MachineEvent, S extends string>(
  config: MachineConfig<C, E, S>,
): Machine<C, E, S> {
  let snapshot: Snapshot<C, S> = { state: config.initial, context: config.context };
  const listeners = new Set<(snapshot: Snapshot<C, S>) => void>();

  return {
    getSnapshot: () => snapshot,
    matches: (...states) => states.includes(snapshot.state),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    send(event) {
      const current = config.states[snapshot.state];
      const on = current.on as Record<string, S | Transition<C, E, S> | undefined> | undefined;
      const entry = on?.[event.type];
      if (entry === undefined) return;

      const transition: Transition<C, E, S> = typeof entry === 'string' ? { target: entry } : entry;
      if (transition.guard && !transition.guard(snapshot.context, event)) return;

      const context = transition.update
        ? transition.update(snapshot.context, event)
        : snapshot.context;
      const target = transition.target ?? snapshot.state;
      const stateChanged = target !== snapshot.state;
      if (!stateChanged && context === snapshot.context) return;

      if (stateChanged) current.exit?.(snapshot.context);
      snapshot = { state: target, context };
      if (stateChanged) config.states[target].entry?.(context);
      listeners.forEach((listener) => listener(snapshot));
    },
  };
}
