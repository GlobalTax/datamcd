import React from 'react';
import { cn } from '@/lib/utils';

interface HubStatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'neutral' | 'loading';
  label: string;
  subtitle?: string;
  pulse?: boolean;
}

const statusConfig = {
  success: {
    dot: 'bg-green-500',
    text: 'text-green-700',
    bg: 'bg-green-50'
  },
  warning: {
    dot: 'bg-yellow-500', 
    text: 'text-yellow-700',
    bg: 'bg-yellow-50'
  },
  error: {
    dot: 'bg-red-500',
    text: 'text-red-700', 
    bg: 'bg-red-50'
  },
  neutral: {
    dot: 'bg-gray-400',
    text: 'text-gray-600',
    bg: 'bg-gray-50'
  },
  loading: {
    dot: 'bg-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50'
  }
};

export const HubStatusIndicator: React.FC<HubStatusIndicatorProps> = ({
  status,
  label,
  subtitle,
  pulse = false
}) => {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      'flex items-center space-x-2 p-2 rounded-md transition-colors',
      config.bg
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        config.dot,
        pulse && status === 'loading' && 'animate-pulse'
      )} />
      
      <div className="flex-1 min-w-0">
        <div className={cn('text-sm font-medium', config.text)}>
          {label}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};