import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ className, padding = 'md', children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div
      className={cn(
        'bg-[#0f172a] border border-white/8 rounded-xl',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
