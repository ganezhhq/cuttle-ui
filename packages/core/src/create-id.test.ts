import { expect, it } from 'vitest';
import { createId, createIdFactory } from './create-id';

it('produces the same sequence from separate factories, as SSR hydration needs', () => {
  const server = createIdFactory();
  const client = createIdFactory();
  expect([server(), server('label')]).toEqual([client(), client('label')]);
  expect(createIdFactory('x')('y')).toBe('x-1-y');
});

it('derives part IDs from a root ID', () => {
  expect(createId('root')).toBe('root');
  expect(createId('root', 'trigger')).toBe('root-trigger');
});
