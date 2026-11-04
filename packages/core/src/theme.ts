type Rgb = [number, number, number];

const DARK_BG: Rgb = [15, 15, 18];
const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const INK = '#111118';
/** The contrast WCAG AA asks of normal text. */
const MIN_CONTRAST = 4.5;

/** Reads `#rgb` or `#rrggbb`. Returns null for anything else. */
function parseHex(hex: string): Rgb | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) return null;
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  return [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16)) as Rgb;
}

const toHex = (rgb: Rgb) =>
  `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const mix = (from: Rgb, to: Rgb, amount: number) =>
  from.map((value, index) => value + ((to[index] as number) - value) * amount) as Rgb;

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** The WCAG contrast ratio of two colors, or null if either is not a hex color. */
export function getContrastRatio(first: string, second: string): number | null {
  const a = parseHex(first);
  const b = parseHex(second);
  return a && b ? contrast(a, b) : null;
}

/** Whichever of white or near-black is easier to read on this color. */
function readableOn(rgb: Rgb): string {
  return contrast(rgb, WHITE) >= contrast(rgb, parseHex(INK) as Rgb) ? '#ffffff' : INK;
}

/** Lightens a color until it is readable on the dark background. */
function forDarkMode(rgb: Rgb): Rgb {
  for (let amount = 0.1; amount < 1; amount += 0.05) {
    const candidate = mix(rgb, WHITE, amount);
    if (contrast(candidate, DARK_BG) >= MIN_CONTRAST + 1) return candidate;
  }
  return WHITE;
}

export interface ThemeOptions {
  /** The accent color for light mode, as a hex color. */
  accent: string;
  /** The default radius in pixels. The small and large radii follow from it. */
  radius: number;
}

export interface Theme {
  light: Record<string, string>;
  dark: Record<string, string>;
  radius: Record<string, string>;
  /** Plain-language problems with this choice, such as low contrast. */
  warnings: string[];
  /** Ready to paste after tokens.css. */
  css: string;
}

const block = (selector: string, tokens: Record<string, string>, indent = '') =>
  `${indent}${selector} {\n${Object.entries(tokens)
    .map(([name, value]) => `${indent}  ${name}: ${value};`)
    .join('\n')}\n${indent}}`;

/** Derives the accent and radius tokens for a theme, in light and dark mode. */
export function createTheme({ accent, radius }: ThemeOptions): Theme {
  const base = parseHex(accent);
  if (!base) throw new Error(`"${accent}" is not a hex color.`);
  const size = Math.max(0, Math.round(radius));
  const dark = forDarkMode(base);

  const light = {
    '--cuttle-accent': toHex(base),
    '--cuttle-accent-hover': toHex(mix(base, BLACK, 0.15)),
    '--cuttle-accent-contrast': readableOn(base),
    '--cuttle-accent-tint': toHex(mix(WHITE, base, 0.08)),
  };
  const darkTokens = {
    '--cuttle-accent': toHex(dark),
    '--cuttle-accent-hover': toHex(mix(dark, WHITE, 0.2)),
    '--cuttle-accent-contrast': readableOn(dark),
    '--cuttle-accent-tint': toHex(mix(DARK_BG, base, 0.25)),
  };
  const radiusTokens = {
    '--cuttle-radius-sm': `${Math.round(size * 0.6)}px`,
    '--cuttle-radius': `${size}px`,
    '--cuttle-radius-lg': `${Math.round(size * 1.4)}px`,
  };

  const warnings: string[] = [];
  if (contrast(base, WHITE) < MIN_CONTRAST) {
    warnings.push(
      'In light mode, this accent is hard to read as text, such as on links and soft buttons. Try a darker color.',
    );
  }

  const css = [
    block(':root', { ...light, ...radiusTokens }),
    `@media (prefers-color-scheme: dark) {\n${block(":root:not([data-theme='light'])", darkTokens, '  ')}\n}`,
    block("[data-theme='dark']", darkTokens),
  ].join('\n\n');

  return { light, dark: darkTokens, radius: radiusTokens, warnings, css: `${css}\n` };
}
