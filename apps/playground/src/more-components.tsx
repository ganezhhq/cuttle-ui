import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  Code,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  Heading,
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
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@cuttle-ui/react';

const FRUIT = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

function FormsSection() {
  const [invalid, setInvalid] = useState(true);
  const [alerts, setAlerts] = useState(false);

  return (
    <section aria-labelledby="forms">
      <h2 id="forms">Forms</h2>
      <div className="demo-form">
        <Field>
          <Label>Name</Label>
          <Input placeholder="Ada Lovelace" />
          <FieldDescription>As it appears on your account.</FieldDescription>
        </Field>
        <Field invalid={invalid} required>
          <Label>Email</Label>
          <Input
            defaultValue="not an email"
            onChange={(event) => setInvalid(!event.target.value.includes('@'))}
          />
          <FieldError>Enter a valid email address.</FieldError>
        </Field>
        <Stack direction="row" gap={2} align="center" wrap>
          <Input size="sm" aria-label="Small input" placeholder="Small" />
          <Input size="lg" aria-label="Large input" placeholder="Large" />
          <Input disabled aria-label="Disabled input" placeholder="Disabled" />
        </Stack>
        <Field>
          <Label>Bio</Label>
          <Textarea autoResize placeholder="This grows as you type" />
        </Field>
        <Field>
          <Label>Fruit</Label>
          <Select options={FRUIT} placeholder="Pick a fruit" />
        </Field>
        <Field>
          <Label>Plan</Label>
          <RadioGroup defaultValue="free">
            <Radio value="free">Free</Radio>
            <Radio value="team">Team</Radio>
            <Radio value="legacy" disabled>
              Legacy
            </Radio>
          </RadioGroup>
        </Field>
        <Stack gap={2} align="start">
          <Checkbox>Accept terms</Checkbox>
          <Checkbox defaultChecked>Checked</Checkbox>
          <Checkbox defaultChecked="indeterminate">Some items</Checkbox>
          <Checkbox disabled>Disabled</Checkbox>
        </Stack>
        <Field>
          <Label>Email alerts</Label>
          <Switch checked={alerts} onCheckedChange={setAlerts} />
          <FieldDescription>Alerts are {alerts ? 'on' : 'off'}.</FieldDescription>
        </Field>
      </div>
    </section>
  );
}

function OverlaysSection() {
  return (
    <section aria-labelledby="overlays">
      <h2 id="overlays">Overlays</h2>
      <div className="demo-row">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
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
        <Tooltip openDelay={50} closeDelay={50}>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Saves your work</TooltipContent>
        </Tooltip>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Overlays in a dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Overlays in a dialog</DialogTitle>
            <Field>
              <Label>Dialog fruit</Label>
              <Select options={FRUIT} placeholder="Pick a fruit" />
            </Field>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Inner popover</Button>
              </PopoverTrigger>
              <PopoverContent aria-label="Inner">
                <Button size="sm">Inner action</Button>
              </PopoverContent>
            </Popover>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function LayoutSection() {
  return (
    <section aria-labelledby="layout">
      <h2 id="layout">Layout and type</h2>
      <Stack gap={4}>
        <Card>
          <CardHeader>
            <Heading level={3}>Tinted card</Heading>
            <Text size="sm" muted>
              With a header, content and footer.
            </Text>
          </CardHeader>
          <CardContent>
            <Text>
              Use <Code>Stack</Code> to space things evenly.
            </Text>
          </CardContent>
          <CardFooter>
            <Button size="sm">Save</Button>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </CardFooter>
        </Card>
        <Card tinted={false}>
          <Stack direction="row" justify="between" align="center" wrap>
            <Text>Plain card, row stack</Text>
            <Button size="sm" variant="soft">
              Action
            </Button>
          </Stack>
        </Card>
        <Stack gap={1}>
          <Heading level={3} size="2xl">
            Heading 2xl
          </Heading>
          <Heading level={3} size="xl">
            Heading xl
          </Heading>
          <Heading level={3} size="lg">
            Heading lg
          </Heading>
          <Text size="lg">Text lg</Text>
          <Text>Text md</Text>
          <Text size="sm" muted>
            Text sm, muted
          </Text>
        </Stack>
      </Stack>
    </section>
  );
}

export function MoreComponents() {
  return (
    <>
      <FormsSection />
      <OverlaysSection />
      <LayoutSection />
    </>
  );
}
