import type { IconProps } from './Icon.props';

export function Icon({ className, id, ...props }: IconProps) {
  return (
    <svg className={className} {...props}>
      <use href={`sprite.svg#${id}`} />
    </svg>
  );
}
