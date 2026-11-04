import { CheckIcon } from '@cuttle-ui/icons/react';
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Field,
  Heading,
  Input,
  Label,
  Popover,
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
} from '@cuttle-ui/react';
import { Toggle } from './toggle';

/** Renders the adapter on the server. `next build` fails if it touches browser globals. */
export default function Page() {
  return (
    <main>
      <h1>Cuttle SSR check</h1>
      <CheckIcon />
      <Toggle />
      <Button>Button</Button>
      <Stack>
        <Card>
          <Heading>Heading</Heading>
          <Text>Text</Text>
        </Card>
        <Field>
          <Label>Name</Label>
          <Input />
        </Field>
        <Textarea aria-label="Notes" autoResize />
        <Checkbox>Check</Checkbox>
        <RadioGroup aria-label="Plan" defaultValue="a">
          <Radio value="a">A</Radio>
        </RadioGroup>
        <Switch aria-label="Alerts" />
        <Select aria-label="Fruit" options={[{ value: 'a', label: 'A' }]} />
        <Popover>
          <PopoverTrigger>Popover</PopoverTrigger>
          <PopoverContent aria-label="Popover">Content</PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger>Tooltip</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </Stack>
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    </main>
  );
}
