import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  Code,
  Field,
  FieldDescription,
  FieldError,
  Heading,
  Input,
  Label,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './index';

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
const q = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);
const press = async (element: Element | null) => {
  await act(async () => (element as HTMLElement).click());
  await flush();
};
const key = async (target: Element | null, name: string) => {
  await act(async () => {
    target?.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
  });
  await flush();
};

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
});

describe('Input', () => {
  it('passes size and invalid state through', async () => {
    await mount(<Input size="lg" invalid aria-label="Name" />);
    const input = q('input');
    expect(input?.dataset).toMatchObject({ cuttle: 'input', size: 'lg' });
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.classList.contains('cuttle-focus')).toBe(true);
  });

  it('leaves aria-invalid off when valid', async () => {
    await mount(<Input aria-label="Name" />);
    expect(q('input')?.hasAttribute('aria-invalid')).toBe(false);
  });
});

describe('Textarea', () => {
  it('sets a height with autoResize', async () => {
    await mount(<Textarea autoResize aria-label="Notes" defaultValue="Hello" />);
    const textarea = q<HTMLTextAreaElement>('textarea');
    expect(textarea?.style.height).not.toBe('');
    expect(textarea?.hasAttribute('data-auto-resize')).toBe(true);
  });

  it('leaves the height alone without autoResize', async () => {
    await mount(<Textarea aria-label="Notes" />);
    expect(q('textarea')?.style.height).toBe('');
  });
});

describe('Field', () => {
  const Example = ({ invalid = false }: { invalid?: boolean }) => (
    <Field invalid={invalid} required>
      <Label>Email</Label>
      <Input />
      <FieldDescription>Work address</FieldDescription>
      <FieldError>Enter an email</FieldError>
    </Field>
  );

  it('connects the label and description', async () => {
    await mount(<Example />);
    await flush();
    const input = q('input');
    const label = q<HTMLLabelElement>('label');
    expect(label?.htmlFor).toBe(input?.id);
    expect(input?.hasAttribute('required')).toBe(true);
    expect(
      document.getElementById(input?.getAttribute('aria-describedby') ?? '')?.textContent,
    ).toBe('Work address');
  });

  it('shows the error only while invalid, and connects it', async () => {
    await mount(<Example />);
    expect(q('[data-cuttle="field-error"]')).toBeNull();
    cleanups.splice(0).forEach((cleanup) => cleanup());
    await mount(<Example invalid />);
    await flush();
    const input = q('input');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    const parts = input?.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(parts).toHaveLength(2);
    expect(document.getElementById(parts[1] ?? '')?.textContent).toBe('Enter an email');
  });

  it('passes disabled down to the control', async () => {
    await mount(
      <Field disabled>
        <Label>Name</Label>
        <Textarea />
      </Field>,
    );
    expect(q<HTMLTextAreaElement>('textarea')?.disabled).toBe(true);
  });

  it('labels a radio group through aria-labelledby', async () => {
    await mount(
      <Field>
        <Label>Plan</Label>
        <RadioGroup>
          <Radio value="a">A</Radio>
        </RadioGroup>
      </Field>,
    );
    await flush();
    expect(q('[role="radiogroup"]')?.getAttribute('aria-labelledby')).toBe(q('label')?.id);
  });
});

describe('Checkbox', () => {
  it('toggles and reports the change', async () => {
    const onCheckedChange = vi.fn();
    await mount(<Checkbox onCheckedChange={onCheckedChange}>Terms</Checkbox>);
    const input = q<HTMLInputElement>('input');
    await press(input);
    expect(input?.checked).toBe(true);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(q('[data-cuttle="checkbox"]')?.dataset.state).toBe('checked');
  });

  it('shows indeterminate and checks from it', async () => {
    const onCheckedChange = vi.fn();
    await mount(<Checkbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />);
    const input = q<HTMLInputElement>('input');
    expect(input?.indeterminate).toBe(true);
    await press(input);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(input?.indeterminate).toBe(false);
    expect(input?.checked).toBe(true);
  });

  it('follows the checked prop when controlled', async () => {
    const onCheckedChange = vi.fn();
    await mount(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
    await press(q('input'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(q<HTMLInputElement>('input')?.checked).toBe(false);
  });

  it('does not change while disabled', async () => {
    const onCheckedChange = vi.fn();
    await mount(<Checkbox disabled onCheckedChange={onCheckedChange} />);
    await press(q('input'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe('RadioGroup', () => {
  const Example = (props: { value?: string; onValueChange?: (value: string) => void }) => (
    <RadioGroup aria-label="Plan" defaultValue="a" {...props}>
      <Radio value="a">A</Radio>
      <Radio value="b">B</Radio>
      <Radio value="c" disabled>
        C
      </Radio>
    </RadioGroup>
  );

  it('groups radios by name and selects one', async () => {
    const onValueChange = vi.fn();
    await mount(<Example onValueChange={onValueChange} />);
    const radios = document.querySelectorAll<HTMLInputElement>('input');
    expect(new Set([...radios].map((radio) => radio.name)).size).toBe(1);
    expect(radios[0]?.checked).toBe(true);
    await press(radios[1] ?? null);
    expect(radios[1]?.checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(radios[2]?.disabled).toBe(true);
  });

  it('follows the value prop when controlled', async () => {
    const onValueChange = vi.fn();
    await mount(<Example value="a" onValueChange={onValueChange} />);
    const radios = document.querySelectorAll<HTMLInputElement>('input');
    await press(radios[1] ?? null);
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(radios[0]?.checked).toBe(true);
  });

  it('throws a helpful error outside RadioGroup', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderToString(<Radio value="a" />)).toThrow(
      'Radio must be used inside RadioGroup.',
    );
    error.mockRestore();
  });
});

describe('Switch', () => {
  it('toggles with the switch role', async () => {
    const onCheckedChange = vi.fn();
    await mount(<Switch aria-label="Alerts" onCheckedChange={onCheckedChange} />);
    const element = q('[role="switch"]');
    expect(element?.getAttribute('aria-checked')).toBe('false');
    await press(element);
    expect(element?.getAttribute('aria-checked')).toBe('true');
    expect(element?.dataset.state).toBe('on');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('follows the checked prop when controlled', async () => {
    await mount(<Switch aria-label="Alerts" checked />);
    const element = q('[role="switch"]');
    await press(element);
    expect(element?.getAttribute('aria-checked')).toBe('true');
  });

  it('sends a value with a form only while on', async () => {
    await mount(<Switch aria-label="Alerts" name="alerts" />);
    expect(q('input[name="alerts"]')).toBeNull();
    await press(q('[role="switch"]'));
    expect(q<HTMLInputElement>('input[name="alerts"]')?.value).toBe('on');
  });
});

describe('Popover', () => {
  const Example = () => (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent aria-label="Details">
        <input aria-label="Name" />
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
  const trigger = () => q('[data-cuttle="popover-trigger"]');
  const content = () => q('[data-cuttle="popover-content"]');

  it('toggles and moves focus in', async () => {
    await mount(<Example />);
    expect(content()).toBeNull();
    await press(trigger());
    expect(content()?.getAttribute('role')).toBe('dialog');
    expect(trigger()?.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(q('input'));
    await press(trigger());
    expect(content()).toBeNull();
  });

  it('returns focus on Esc', async () => {
    await mount(<Example />);
    await press(trigger());
    await key(document.body, 'Escape');
    expect(content()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on an outside press without taking focus back', async () => {
    await mount(<Example />);
    await press(trigger());
    await act(async () => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    await flush();
    expect(content()).toBeNull();
  });

  it('closes when Tab leaves the last element', async () => {
    await mount(<Example />);
    await press(trigger());
    q('[data-cuttle="popover-close"]')?.focus();
    await key(q('[data-cuttle="popover-close"]'), 'Tab');
    expect(content()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe('Tooltip', () => {
  const Example = () => (
    <Tooltip openDelay={0} closeDelay={0}>
      <TooltipTrigger>Save</TooltipTrigger>
      <TooltipContent>Saves your work</TooltipContent>
    </Tooltip>
  );
  const trigger = () => q('[data-cuttle="tooltip-trigger"]');
  const tooltip = () => q('[role="tooltip"]');

  it('shows on focus, describes the trigger, and hides on blur', async () => {
    await mount(<Example />);
    await act(async () => trigger()?.focus());
    await flush();
    expect(tooltip()?.textContent).toBe('Saves your work');
    expect(trigger()?.getAttribute('aria-describedby')).toBe(tooltip()?.id);
    await act(async () => trigger()?.blur());
    await flush();
    expect(tooltip()).toBeNull();
    expect(trigger()?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('hides on Esc', async () => {
    await mount(<Example />);
    await act(async () => trigger()?.focus());
    await flush();
    await key(document.body, 'Escape');
    expect(tooltip()).toBeNull();
  });
});

describe('Select', () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana', disabled: true },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
  ];
  const trigger = () => q('[role="combobox"]');
  const list = () => q('[role="listbox"]');
  const active = () =>
    document.getElementById(trigger()?.getAttribute('aria-activedescendant') ?? '')?.textContent;

  it('shows the placeholder, then the selected label', async () => {
    const onValueChange = vi.fn();
    await mount(
      <Select
        aria-label="Fruit"
        options={options}
        placeholder="Pick"
        onValueChange={onValueChange}
      />,
    );
    expect(trigger()?.textContent).toBe('Pick');
    expect(trigger()?.getAttribute('aria-expanded')).toBe('false');
    await press(trigger());
    expect(list()).not.toBeNull();
    await press(document.querySelectorAll('[role="option"]')[2] ?? null);
    expect(list()).toBeNull();
    expect(trigger()?.textContent).toBe('Cherry');
    expect(onValueChange).toHaveBeenCalledWith('cherry');
  });

  it('skips disabled options with the arrow keys and selects with Enter', async () => {
    await mount(<Select aria-label="Fruit" options={options} />);
    await key(trigger(), 'ArrowDown');
    expect(active()).toBe('Apple');
    await key(trigger(), 'ArrowDown');
    expect(active()).toBe('Cherry');
    await key(trigger(), 'Enter');
    expect(trigger()?.textContent).toBe('Cherry');
  });

  it('goes to the ends with Home and End', async () => {
    await mount(<Select aria-label="Fruit" options={options} />);
    await key(trigger(), 'ArrowDown');
    await key(trigger(), 'End');
    expect(active()).toBe('Date');
    await key(trigger(), 'Home');
    expect(active()).toBe('Apple');
  });

  it('moves with typeahead', async () => {
    await mount(<Select aria-label="Fruit" options={options} />);
    await key(trigger(), 'ArrowDown');
    await key(trigger(), 'd');
    expect(active()).toBe('Date');
  });

  it('does not select a disabled option', async () => {
    const onValueChange = vi.fn();
    await mount(<Select aria-label="Fruit" options={options} onValueChange={onValueChange} />);
    await press(trigger());
    await press(document.querySelectorAll('[role="option"]')[1] ?? null);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(list()).not.toBeNull();
  });

  it('closes on Esc and keeps the value', async () => {
    await mount(<Select aria-label="Fruit" options={options} defaultValue="date" />);
    await key(trigger(), 'ArrowDown');
    expect(active()).toBe('Date');
    await key(document.body, 'Escape');
    expect(list()).toBeNull();
    expect(trigger()?.textContent).toBe('Date');
  });

  it('follows the value prop when controlled', async () => {
    const Controlled = () => {
      const [value] = useState('apple');
      return <Select aria-label="Fruit" options={options} value={value} />;
    };
    await mount(<Controlled />);
    await press(trigger());
    await press(document.querySelectorAll('[role="option"]')[2] ?? null);
    expect(trigger()?.textContent).toBe('Apple');
  });

  it('sends its value with a form', async () => {
    await mount(<Select aria-label="Fruit" options={options} name="fruit" defaultValue="date" />);
    expect(q<HTMLInputElement>('input[name="fruit"]')?.value).toBe('date');
  });

  it('picks up a Field label', async () => {
    await mount(
      <Field>
        <Label>Fruit</Label>
        <Select options={options} />
      </Field>,
    );
    await flush();
    expect(trigger()?.getAttribute('aria-labelledby')).toBe(q('label')?.id);
  });
});

describe('Card, Stack and Typography', () => {
  it('renders the parts of a Card', async () => {
    await mount(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(q('[data-cuttle="card"]')?.hasAttribute('data-tinted')).toBe(true);
    expect(q('[data-cuttle="card-footer"]')?.textContent).toBe('Footer');
  });

  it('can render a Card as another element', async () => {
    await mount(
      <Card asChild tinted={false}>
        <article>Content</article>
      </Card>,
    );
    expect(q('article')?.dataset.cuttle).toBe('card');
    expect(q('article')?.hasAttribute('data-tinted')).toBe(false);
  });

  it('applies Stack props', async () => {
    await mount(
      <Stack direction="row" gap={5} align="center" justify="between" wrap>
        Content
      </Stack>,
    );
    const stack = q('[data-cuttle="stack"]');
    expect(stack?.dataset).toMatchObject({ direction: 'row', align: 'center', justify: 'between' });
    expect(stack?.style.gap).toBe('var(--cuttle-space-5)');
  });

  it('renders the requested heading level', async () => {
    await mount(
      <Heading level={3} size="xl">
        Title
      </Heading>,
    );
    expect(q('h3')?.dataset).toMatchObject({ cuttle: 'heading', size: 'xl' });
  });

  it('sizes a heading by its level by default', async () => {
    await mount(<Heading level={1}>Title</Heading>);
    expect(q('h1')?.dataset.size).toBe('2xl');
  });

  it('renders Text and Code', async () => {
    await mount(
      <>
        <Text muted size="sm">
          Body
        </Text>
        <Text asChild>
          <span>Inline</span>
        </Text>
        <Code>x</Code>
      </>,
    );
    expect(q('p')?.dataset).toMatchObject({ cuttle: 'text', size: 'sm' });
    expect(q('p')?.hasAttribute('data-muted')).toBe(true);
    expect(q('span')?.dataset.cuttle).toBe('text');
    expect(q('code')?.dataset.cuttle).toBe('code');
  });
});

describe('server rendering', () => {
  it('renders every component without touching the document', () => {
    const html = renderToString(
      <Stack>
        <Field>
          <Label>Name</Label>
          <Input />
          <Textarea autoResize />
        </Field>
        <Checkbox defaultChecked="indeterminate" />
        <RadioGroup aria-label="Plan">
          <Radio value="a" />
        </RadioGroup>
        <Switch aria-label="On" />
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent aria-label="Details">Content</PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger>Save</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
        <Select aria-label="Fruit" options={[{ value: 'a', label: 'A' }]} />
        <Card>
          <Heading>Title</Heading>
          <Text>Body</Text>
        </Card>
      </Stack>,
    );
    expect(html).toContain('data-cuttle="stack"');
    expect(html).not.toContain('role="tooltip"');
  });
});
