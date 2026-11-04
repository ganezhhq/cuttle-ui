import type { SVGProps } from 'react';
import { iconAttributes, icons } from './index';
import type { IconName } from './index';

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

/** Decorative by default. Pass `aria-label` to expose the icon to assistive technology. */
export function Icon({ name, size = 24, ...props }: IconProps) {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  return (
    <svg
      {...iconAttributes}
      width={size}
      height={size}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}

const named = (name: IconName) => (props: Omit<IconProps, 'name'>) => (
  <Icon name={name} {...props} />
);

export const ChevronUpIcon = named('chevron-up');
export const ChevronDownIcon = named('chevron-down');
export const ChevronLeftIcon = named('chevron-left');
export const ChevronRightIcon = named('chevron-right');
export const CloseIcon = named('close');
export const CheckIcon = named('check');
export const SearchIcon = named('search');
export const PlusIcon = named('plus');
export const MinusIcon = named('minus');
export const CalendarIcon = named('calendar');
export const InfoIcon = named('info');
export const WarningIcon = named('warning');
