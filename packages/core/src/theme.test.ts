import { describe, expect, it } from 'vitest';
import { createTheme, getContrastRatio } from './theme';

const DARK_BG = '#0f0f12';
const accentOf = (tokens: Record<string, string>) => tokens['--cuttle-accent'] as string;
const contrastOf = (tokens: Record<string, string>) => tokens['--cuttle-accent-contrast'] as string;

describe('getContrastRatio', () => {
  it('matches the known extremes', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(getContrastRatio('#fff', '#fff')).toBeCloseTo(1);
  });

  it('returns null for something that is not a hex color', () => {
    expect(getContrastRatio('red', '#fff')).toBeNull();
  });
});

describe('createTheme', () => {
  it('rejects an invalid color', () => {
    expect(() => createTheme({ accent: 'nope', radius: 8 })).toThrow('not a hex color');
  });

  it('accepts short hex colors', () => {
    expect(accentOf(createTheme({ accent: '#0a0', radius: 8 }).light)).toBe('#00aa00');
  });

  it('derives the radius scale, and never goes below zero', () => {
    expect(createTheme({ accent: '#4f46e5', radius: 10 }).radius).toEqual({
      '--cuttle-radius-sm': '6px',
      '--cuttle-radius': '10px',
      '--cuttle-radius-lg': '14px',
    });
    expect(createTheme({ accent: '#4f46e5', radius: -4 }).radius['--cuttle-radius']).toBe('0px');
  });

  it.each(['#4f46e5', '#0f766e', '#000000', '#7f1d1d', '#1d4ed8', '#ffffff', '#facc15'])(
    'keeps text readable for %s',
    (accent) => {
      const { light, dark } = createTheme({ accent, radius: 8 });
      expect(getContrastRatio(accentOf(light), contrastOf(light))).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(accentOf(dark), contrastOf(dark))).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(accentOf(dark), DARK_BG)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(['#4f46e5', '#0f766e', '#be123c', '#27272a', '#000000', '#7f1d1d', '#1d4ed8', '#facc15'])(
    'keeps soft buttons readable in dark mode for %s',
    (accent) => {
      const { dark } = createTheme({ accent, radius: 8 });
      expect(
        getContrastRatio(accentOf(dark), dark['--cuttle-accent-tint'] as string),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(['#4f46e5', '#0f766e', '#be123c', '#27272a', '#000000', '#7f1d1d', '#1d4ed8'])(
    'keeps soft buttons readable in light mode for %s',
    (accent) => {
      const { light } = createTheme({ accent, radius: 8 });
      expect(
        getContrastRatio(accentOf(light), light['--cuttle-accent-tint'] as string),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('warns when the accent is too light to read as text in light mode', () => {
    expect(createTheme({ accent: '#4f46e5', radius: 8 }).warnings).toEqual([]);
    expect(createTheme({ accent: '#facc15', radius: 8 }).warnings[0]).toContain('hard to read');
  });

  it('writes CSS that overrides each way tokens.css sets the accent', () => {
    const { css } = createTheme({ accent: '#0f766e', radius: 8 });
    expect(css).toContain(':root {\n  --cuttle-accent: #0f766e;');
    expect(css).toContain(
      "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light']) {",
    );
    expect(css).toContain("[data-theme='dark'] {");
    expect(css).toContain('--cuttle-radius: 8px;');
  });
});
