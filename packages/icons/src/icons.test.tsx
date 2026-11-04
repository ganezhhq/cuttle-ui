import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { iconNames, iconToSvg, icons } from './index';
import { CheckIcon, Icon } from './react';

it('includes the initial icon set', () => {
  expect(iconNames).toEqual(
    expect.arrayContaining([
      'chevron-down',
      'close',
      'check',
      'search',
      'plus',
      'minus',
      'calendar',
      'info',
      'warning',
    ]),
  );
});

it('builds decorative SVG strings', () => {
  const svg = iconToSvg('check', 16);
  expect(svg).toContain('width="16"');
  expect(svg).toContain('aria-hidden="true"');
  expect(svg).toContain(icons.check);
});

it('renders React icons as decorative unless labelled', () => {
  expect(renderToStaticMarkup(<CheckIcon />)).toContain('aria-hidden="true"');
  const labelled = renderToStaticMarkup(<Icon name="info" aria-label="Details" size={20} />);
  expect(labelled).toContain('role="img"');
  expect(labelled).toContain('width="20"');
  expect(labelled).not.toContain('aria-hidden');
});
