'use client';

import { useId } from 'react';
import { createId, createMachine } from '@cuttle/core';
import { Slot, useMachine } from '@cuttle/react';

const createToggle = () =>
  createMachine<null, { type: 'TOGGLE' }, 'off' | 'on'>({
    initial: 'off',
    context: null,
    states: { off: { on: { TOGGLE: 'on' } }, on: { on: { TOGGLE: 'off' } } },
  });

export function Toggle() {
  const [snapshot, send] = useMachine(createToggle);
  const id = createId(useId(), 'toggle');
  return (
    <Slot data-cuttle="toggle" data-state={snapshot.state}>
      <button id={id} type="button" onClick={() => send({ type: 'TOGGLE' })}>
        {snapshot.state}
      </button>
    </Slot>
  );
}
