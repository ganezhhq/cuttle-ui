import { useEffect, useId, useMemo, useState } from 'react';
import { createTheme } from '@cuttle-ui/core';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  Heading,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Text,
} from '@cuttle-ui/react';

const DEFAULT_ACCENT = '#4f46e5';
const DEFAULT_RADIUS = 10;
const PRESETS = [
  { name: 'Ink', accent: '#4f46e5' },
  { name: 'Teal', accent: '#0f766e' },
  { name: 'Crimson', accent: '#be123c' },
  { name: 'Graphite', accent: '#27272a' },
];
const SCHEMES = ['system', 'light', 'dark'] as const;
type Scheme = (typeof SCHEMES)[number];
const HEX = /^#([\da-f]{3}|[\da-f]{6})$/i;

/** The value for a color input, which only understands `#rrggbb`. */
const toLongHex = (hex: string) =>
  hex.length === 4 ? `#${[...hex.slice(1)].map((d) => d + d).join('')}` : hex;

export function ThemePlayground() {
  const [accentText, setAccentText] = useState(DEFAULT_ACCENT);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [scheme, setScheme] = useState<Scheme>('system');
  const [copyStatus, setCopyStatus] = useState('');
  const radiusId = useId();

  const theme = useMemo(() => createTheme({ accent, radius }), [accent, radius]);
  const accentInvalid = !HEX.test(accentText);

  // Applies the same CSS people will copy, so the preview cannot differ from the result.
  useEffect(() => {
    const style = document.createElement('style');
    style.dataset.cuttleThemePlayground = '';
    style.textContent = theme.css;
    document.head.append(style);
    return () => style.remove();
  }, [theme.css]);

  useEffect(() => {
    const root = document.documentElement;
    if (scheme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', scheme);
    return () => root.removeAttribute('data-theme');
  }, [scheme]);

  const chooseAccent = (value: string) => {
    setAccentText(value);
    setCopyStatus('');
    if (HEX.test(value)) setAccent(value);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(theme.css);
      setCopyStatus('Copied.');
    } catch {
      setCopyStatus('Could not copy. Select the CSS above and copy it yourself.');
    }
  };

  return (
    <Stack gap={5}>
      <Stack gap={4}>
        <Field invalid={accentInvalid}>
          <Label>Accent color</Label>
          <Stack direction="row" gap={2} align="center">
            <Input
              value={accentText}
              onChange={(event) => chooseAccent(event.target.value)}
              spellCheck={false}
              style={{ maxWidth: 160 }}
            />
            <input
              type="color"
              aria-label="Pick an accent color"
              value={toLongHex(accent)}
              onChange={(event) => chooseAccent(event.target.value)}
              className="cuttle-focus"
            />
          </Stack>
          {accentInvalid ? (
            <p data-cuttle="field-error">Enter a hex color, such as #0f766e.</p>
          ) : null}
        </Field>
        <Stack direction="row" gap={2} wrap>
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              size="sm"
              variant="outline"
              aria-pressed={accent === preset.accent}
              onClick={() => chooseAccent(preset.accent)}
            >
              {preset.name}
            </Button>
          ))}
        </Stack>
        <Stack gap={1}>
          <Label htmlFor={radiusId}>Radius: {radius}px</Label>
          <input
            id={radiusId}
            type="range"
            min={0}
            max={24}
            value={radius}
            onChange={(event) => {
              setRadius(Number(event.target.value));
              setCopyStatus('');
            }}
            className="cuttle-focus"
            style={{ maxWidth: 320, accentColor: 'var(--cuttle-accent)' }}
          />
        </Stack>
        <Stack gap={1}>
          <Text size="sm">Preview mode</Text>
          <RadioGroup
            aria-label="Preview mode"
            orientation="horizontal"
            value={scheme}
            onValueChange={(value) => setScheme(value as Scheme)}
          >
            {SCHEMES.map((option) => (
              <Radio key={option} value={option}>
                {option}
              </Radio>
            ))}
          </RadioGroup>
        </Stack>
        {theme.warnings.map((warning) => (
          <Text key={warning} size="sm" role="status" style={{ color: 'var(--cuttle-warning)' }}>
            {warning}
          </Text>
        ))}
      </Stack>

      <Card aria-label="Preview">
        <CardHeader>
          <Heading level={2}>Preview</Heading>
          <Text size="sm" muted>
            These are real components, using your theme.
          </Text>
        </CardHeader>
        <CardContent>
          <Stack gap={4}>
            <Stack direction="row" gap={2} wrap align="center">
              <Button>Solid</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </Stack>
            <Field>
              <Label>Email</Label>
              <Input placeholder="ada@example.com" />
              <FieldDescription>Press Tab to see the focus ring.</FieldDescription>
            </Field>
            <Field>
              <Label>Fruit</Label>
              <Select
                placeholder="Pick a fruit"
                options={[
                  { value: 'apple', label: 'Apple' },
                  { value: 'cherry', label: 'Cherry' },
                ]}
              />
            </Field>
            <Stack direction="row" gap={4} align="center" wrap>
              <Checkbox defaultChecked>Checkbox</Checkbox>
              <Switch aria-label="Example switch" defaultChecked />
            </Stack>
          </Stack>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Your theme</DialogTitle>
              <DialogDescription>Dialogs use the larger radius.</DialogDescription>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Stack gap={2}>
        <Heading level={2}>Your CSS</Heading>
        <Text size="sm" muted>
          Paste it after you import tokens.css.
        </Text>
        <pre tabIndex={0} aria-label="Generated CSS">
          <code>{theme.css}</code>
        </pre>
        <Stack direction="row" gap={3} align="center">
          <Button onClick={() => void copy()}>Copy CSS</Button>
          <Text size="sm" role="status">
            {copyStatus}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}
