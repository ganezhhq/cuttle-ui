import { CheckIcon } from '@cuttle-ui/icons/react';
import { Button, Dialog, DialogContent, DialogTitle, DialogTrigger } from '@cuttle-ui/react';
import { Toggle } from './toggle';

/** Renders the adapter on the server. `next build` fails if it touches browser globals. */
export default function Page() {
  return (
    <main>
      <h1>Cuttle SSR check</h1>
      <CheckIcon />
      <Toggle />
      <Button>Button</Button>
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    </main>
  );
}
