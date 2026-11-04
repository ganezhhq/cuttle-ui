import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
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
} from '__COMPONENTS__';

export function Demo() {
  const [on, setOn] = useState(false);
  return (
    <main style={{ maxWidth: 480, margin: '32px auto' }}>
      <Stack gap={4}>
        <Heading level={1}>Fresh project</Heading>
        <Card>
          <CardHeader>
            <Heading level={2}>Card</Heading>
          </CardHeader>
          <CardContent>
            <Field>
              <Label>Name</Label>
              <Input />
              <FieldDescription>Help</FieldDescription>
            </Field>
          </CardContent>
          <CardFooter>
            <Button>Save</Button>
          </CardFooter>
        </Card>
        <Textarea aria-label="Notes" autoResize />
        <Checkbox>Check</Checkbox>
        <RadioGroup aria-label="Plan" defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
        <Switch aria-label="Alerts" checked={on} onCheckedChange={setOn} />
        <Select aria-label="Fruit" options={[{ value: 'apple', label: 'Apple' }]} />
        <Tooltip>
          <TooltipTrigger>Tip</TooltipTrigger>
          <TooltipContent>Text</TooltipContent>
        </Tooltip>
        <Popover>
          <PopoverTrigger>Pop</PopoverTrigger>
          <PopoverContent aria-label="Pop">
            <Text>Content</Text>
          </PopoverContent>
        </Popover>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Hello</DialogTitle>
            <DialogDescription>From a copied component.</DialogDescription>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </Stack>
    </main>
  );
}
