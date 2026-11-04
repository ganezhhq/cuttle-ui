import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
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
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@cuttle-ui/react';

export function InputDemo() {
  return (
    <Stack gap={2} style={{ maxWidth: 320 }}>
      <Input size="sm" aria-label="Small" placeholder="Small" />
      <Input aria-label="Medium" placeholder="Medium" />
      <Input size="lg" aria-label="Large" placeholder="Large" />
      <Input invalid aria-label="Invalid" defaultValue="Invalid" />
      <Input disabled aria-label="Disabled" placeholder="Disabled" />
    </Stack>
  );
}

export function TextareaDemo() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Textarea autoResize aria-label="Notes" placeholder="This grows as you type" />
    </div>
  );
}

export function LabelDemo() {
  return (
    <Stack gap={1} style={{ maxWidth: 320 }}>
      <Label htmlFor="docs-label-demo">Project name</Label>
      <Input id="docs-label-demo" />
    </Stack>
  );
}

export function FieldDemo() {
  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <Field>
        <Label>Name</Label>
        <Input />
        <FieldDescription>As it appears on your account.</FieldDescription>
      </Field>
      <Field invalid required>
        <Label>Email</Label>
        <Input defaultValue="not an email" />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
    </Stack>
  );
}

export function CheckboxDemo() {
  return (
    <Stack gap={2} align="start">
      <Checkbox>Accept terms</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox defaultChecked="indeterminate">Some items</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
    </Stack>
  );
}

export function RadioGroupDemo() {
  return (
    <RadioGroup aria-label="Plan" defaultValue="free">
      <Radio value="free">Free</Radio>
      <Radio value="team">Team</Radio>
      <Radio value="legacy" disabled>
        Legacy
      </Radio>
    </RadioGroup>
  );
}

export function SwitchDemo() {
  return (
    <Field>
      <Label>Email alerts</Label>
      <Switch />
    </Field>
  );
}

const fruit = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

export function SelectDemo() {
  return (
    <div style={{ maxWidth: 240 }}>
      <Field>
        <Label>Fruit</Label>
        <Select options={fruit} placeholder="Pick a fruit" />
      </Field>
    </div>
  );
}

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover or focus me</Button>
      </TooltipTrigger>
      <TooltipContent>Saves your work</TooltipContent>
    </Tooltip>
  );
}

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Share</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Share">
        <Stack gap={2}>
          <Input aria-label="Link" defaultValue="https://example.com" />
          <PopoverClose asChild>
            <Button size="sm">Done</Button>
          </PopoverClose>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
