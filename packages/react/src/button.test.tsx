import { act, createRef } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mount = async (node: ReactNode) => {
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  await act(async () => root.render(node));
  return container;
};

const press = async (element: Element | null) => {
  await act(async () => (element as HTMLElement).click());
};

describe('Button', () => {
  it('uses safe defaults', async () => {
    const button = (await mount(<Button>Save</Button>)).querySelector('button');
    expect(button?.type).toBe('button');
    expect(button?.dataset).toMatchObject({ cuttle: 'button', variant: 'solid', size: 'md' });
    expect(button?.classList.contains('cuttle-focus')).toBe(true);
  });

  it('passes variant, size, className, type and ref through', async () => {
    const ref = createRef<HTMLButtonElement>();
    const button = (
      await mount(
        <Button ref={ref} variant="danger" size="lg" className="mine" type="submit">
          Delete
        </Button>,
      )
    ).querySelector('button');
    expect(ref.current).toBe(button);
    expect(button?.type).toBe('submit');
    expect(button?.dataset).toMatchObject({ variant: 'danger', size: 'lg' });
    expect(button?.classList.contains('mine')).toBe(true);
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    const button = (await mount(<Button onClick={onClick}>Save</Button>)).querySelector('button');
    await press(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ignores presses while loading but stays focusable', async () => {
    const onClick = vi.fn();
    const button = (
      await mount(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      )
    ).querySelector('button');
    await press(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button?.disabled).toBe(false);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    expect(button?.hasAttribute('data-loading')).toBe(true);
  });

  it('does not submit a form while loading', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const container = await mount(
      <form>
        <Button loading type="submit">
          Save
        </Button>
      </form>,
    );
    container.querySelector('form')?.addEventListener('submit', onSubmit);
    await press(container.querySelector('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses the native disabled attribute on a button', async () => {
    const button = (await mount(<Button disabled>Save</Button>)).querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.hasAttribute('data-disabled')).toBe(true);
  });

  it('styles its child with asChild, without adding button attributes', async () => {
    const ref = createRef<HTMLButtonElement>();
    const link = (
      await mount(
        <Button asChild ref={ref} variant="outline">
          <a href="#docs" className="mine">
            Docs
          </a>
        </Button>,
      )
    ).querySelector('a');
    expect(link?.dataset).toMatchObject({ cuttle: 'button', variant: 'outline' });
    expect(link?.classList.contains('cuttle-focus')).toBe(true);
    expect(link?.classList.contains('mine')).toBe(true);
    expect(link?.hasAttribute('type')).toBe(false);
    expect(link?.hasAttribute('disabled')).toBe(false);
    expect(ref.current as unknown).toBe(link);
  });

  it('blocks a disabled asChild link and its own onClick', async () => {
    const onClick = vi.fn();
    const link = (
      await mount(
        <Button asChild disabled>
          <a href="#docs" onClick={onClick}>
            Docs
          </a>
        </Button>,
      )
    ).querySelector('a');
    await press(link);
    expect(onClick).not.toHaveBeenCalled();
    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.tabIndex).toBe(-1);
  });

  it('renders on the server', () => {
    expect(renderToString(<Button loading>Save</Button>)).toContain('data-cuttle="button"');
  });
});
