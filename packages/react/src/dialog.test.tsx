import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './index';
import type { DialogProps } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const cleanups: Array<() => void> = [];

const mount = async (node: ReactNode) => {
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  await act(async () => root.render(node));
  cleanups.push(() => {
    act(() => root.unmount());
    container.remove();
  });
  return container;
};

const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve)));
const press = async (element: Element | null) => {
  await act(async () => (element as HTMLElement).click());
  await flush();
};
const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');

const Example = (props: DialogProps) => (
  <Dialog {...props}>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
      <input aria-label="Name" />
      <DialogClose>Close</DialogClose>
    </DialogContent>
  </Dialog>
);

const trigger = () => document.querySelector<HTMLElement>('[data-cuttle="dialog-trigger"]');

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
});

describe('Dialog', () => {
  it('renders nothing but the trigger while closed', async () => {
    await mount(<Example />);
    expect(dialog()).toBeNull();
    expect(trigger()?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger()?.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens from the trigger with the right semantics', async () => {
    await mount(<Example />);
    await press(trigger());
    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(trigger()?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger()?.getAttribute('aria-controls')).toBe(dialog()?.id);
    const title = document.getElementById(dialog()?.getAttribute('aria-labelledby') ?? '');
    const description = document.getElementById(dialog()?.getAttribute('aria-describedby') ?? '');
    expect(title?.textContent).toBe('Title');
    expect(description?.textContent).toBe('Description');
  });

  it('moves focus in on open and returns it on close', async () => {
    await mount(<Example />);
    trigger()?.focus();
    await press(trigger());
    expect(document.activeElement).toBe(document.querySelector('input'));
    await press(document.querySelector('[data-cuttle="dialog-close"]'));
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('honors initialFocusRef', async () => {
    const Focused = () => {
      const [element, setElement] = useState<HTMLButtonElement | null>(null);
      return (
        <Dialog defaultOpen>
          <DialogContent initialFocusRef={{ current: element }}>
            <DialogTitle>Title</DialogTitle>
            <input aria-label="Name" />
            <button ref={setElement}>Target</button>
          </DialogContent>
        </Dialog>
      );
    };
    await mount(<Focused />);
    await flush();
    expect(document.activeElement?.textContent).toBe('Target');
  });

  it('closes on Esc', async () => {
    await mount(<Example defaultOpen />);
    await flush();
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await flush();
    expect(dialog()).toBeNull();
  });

  it('closes on an outside press', async () => {
    await mount(<Example defaultOpen />);
    await flush();
    await act(async () => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    await flush();
    expect(dialog()).toBeNull();
  });

  it('stays open on a press inside', async () => {
    await mount(<Example defaultOpen />);
    await flush();
    await act(async () => {
      dialog()?.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    await flush();
    expect(dialog()).not.toBeNull();
  });

  it('can opt out of Esc and outside press', async () => {
    await mount(
      <Dialog defaultOpen>
        <DialogContent closeOnEscape={false} closeOnOutsidePress={false}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    await flush();
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    await flush();
    expect(dialog()).not.toBeNull();
  });

  it('locks scrolling while open', async () => {
    await mount(<Example />);
    await press(trigger());
    expect(document.body.style.overflow).toBe('hidden');
    await press(document.querySelector('[data-cuttle="dialog-close"]'));
    expect(document.body.style.overflow).toBe('');
  });

  it('reports changes in uncontrolled mode', async () => {
    const onOpenChange = vi.fn();
    await mount(<Example onOpenChange={onOpenChange} />);
    await press(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await press(document.querySelector('[data-cuttle="dialog-close"]'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('follows the open prop in controlled mode', async () => {
    const onOpenChange = vi.fn();
    await mount(<Example open={false} onOpenChange={onOpenChange} />);
    await press(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(dialog()).toBeNull();
  });

  it('stays open when a controlled parent refuses to close', async () => {
    const onOpenChange = vi.fn();
    await mount(<Example open onOpenChange={onOpenChange} />);
    await flush();
    await press(document.querySelector('[data-cuttle="dialog-close"]'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(dialog()).not.toBeNull();
  });

  it('works with asChild and Button', async () => {
    await mount(
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const button = document.querySelector<HTMLElement>('[data-cuttle="button"]');
    expect(button?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button?.dataset.variant).toBe('outline');
    await press(button);
    expect(dialog()).not.toBeNull();
    await press(dialog()?.querySelector('button') ?? null);
    expect(dialog()).toBeNull();
  });

  it('renders on the server without touching the document', () => {
    const html = renderToString(<Example defaultOpen />);
    expect(html).toContain('dialog-trigger');
    expect(html).not.toContain('role="dialog"');
  });

  it('throws a helpful error outside Dialog', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderToString(<DialogTitle>Title</DialogTitle>)).toThrow(
      'DialogTitle must be used inside Dialog.',
    );
    error.mockRestore();
  });
});
