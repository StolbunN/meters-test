import { cn } from '../../../utils/cn';
import type { ButtonProps } from './Button.props';

export const Button = ({
  appearance,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'cursor-pointer',
        appearance === 'pagination' &&
          'border border-[#ced5de] rounded-md w-8 h-8 grid place-items-center hover:bg-(--gray-hover)',
        appearance === 'delete' &&
          'rounded-lg w-10 h-10 grid place-items-center bg-(--pink-light) hover:bg-(--pink-hover) transition-colors duration-150',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
