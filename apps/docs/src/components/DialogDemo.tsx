import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@cuttle-ui/react';

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>This is a demo, so nothing is saved.</DialogDescription>
        <DialogClose asChild>
          <Button>Done</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
