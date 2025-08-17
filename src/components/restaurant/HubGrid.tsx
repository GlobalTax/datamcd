import React from 'react';
import { cn } from '@/lib/utils';

interface HubGridProps {
  children: React.ReactNode;
  className?: string;
}

export const HubGrid: React.FC<HubGridProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1',           // Mobile: 1 column
      'md:grid-cols-2',        // Tablet: 2 columns
      'lg:grid-cols-4',        // Desktop: 4 columns
      'xl:grid-cols-4',        // Large: keep 4 columns
      className
    )}>
      {children}
    </div>
  );
};