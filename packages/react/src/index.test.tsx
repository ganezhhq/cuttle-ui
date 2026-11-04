import { act, createRef } from 'react';
import type { MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createMachine } from '@cuttle/core';
import { mergeRefs, Slot, useMachine } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const toggle = () =>
  createMachine<null, { type: 'TOGGLE' }, 'off' | 'on'>({
    initial: 'off',
    context: null,
    states: { off: { on: { TOGGLE: 'on' } }, on: { on: { TOGGLE: 'off' } } },
  });

function Toggle() {
  const [snapshot, send] = useMachine(toggle);
  return <button onClick={() => send({ type: 'TOGGLE' })}>{snapshot.state}</button>;
}

const mount = async (node: React.ReactNode) => {
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  await act(async () => root.render(node));
  return container;
};

describe('useMachine', () => {
  it('re-renders when the machine changes', async () => {
    const container = await mount(<Toggle />);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toBe('off');
    await act(async () => button.click());
    expect(button.textContent).toBe('on');
  });

  it('renders on the server', () => {
    expect(renderToString(<Toggle />)).toContain('off');
  });
});

describe('mergeRefs', () => {
  it('updates object and callback refs', () => {
    const objectRef = createRef<string>();
    const callback = vi.fn();
    mergeRefs(objectRef, callback, undefined)('value');
    expect(objectRef.current).toBe('value');
    expect(callback).toHaveBeenCalledWith('value');
  });
});

describe('Slot', () => {
  it('merges props and refs into the child, with the child winning', async () => {
    const ref = createRef<HTMLAnchorElement>();
    const container = await mount(
      <Slot ref={ref} className="slot" title="slot" data-cuttle="link">
        <a href="#x" className="child" title="child">
          link
        </a>
      </Slot>,
    );
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.className).toBe('slot child');
    expect(link.title).toBe('child');
    expect(link.dataset.cuttle).toBe('link');
    expect(ref.current).toBe(link);
  });

  it('runs the child handler first and lets it cancel the slot handler', async () => {
    const slotClick = vi.fn();
    const container = await mount(
      <Slot onClick={slotClick}>
        <button onClick={(event: MouseEvent) => event.preventDefault()}>go</button>
      </Slot>,
    );
    await act(async () => container.querySelector('button')?.click());
    expect(slotClick).not.toHaveBeenCalled();
  });

  it('throws without a single element child', () => {
    expect(() => renderToString(<Slot>text</Slot>)).toThrow();
  });
});
