import { CheckIcon } from '@cuttle/icons/react';
import { Toggle } from './toggle';

/** Renders the adapter on the server. `next build` fails if it touches browser globals. */
export default function Page() {
  return (
    <main>
      <h1>Cuttle SSR check</h1>
      <CheckIcon />
      <Toggle />
    </main>
  );
}
