import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance: 'pagination' | 'delete';
  children: ReactNode;
}
