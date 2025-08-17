import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HubCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  loading?: boolean;
}

const statusColors = {
  success: 'border-l-green-500 bg-green-50/50',
  warning: 'border-l-yellow-500 bg-yellow-50/50', 
  error: 'border-l-red-500 bg-red-50/50',
  neutral: 'border-l-gray-300 bg-gray-50/25'
};

const iconColors = {
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600', 
  neutral: 'text-gray-600'
};

export const HubCard: React.FC<HubCardProps> = ({
  title,
  icon: Icon,
  children,
  onAction,
  actionLabel = 'Ver más',
  status = 'neutral',
  loading = false
}) => {
  return (
    <Card className={cn(
      'border-l-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01]',
      statusColors[status]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconColors[status])} />
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        ) : (
          children
        )}
        
        {onAction && !loading && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAction}
            className="w-full mt-2 text-xs h-8 hover:bg-muted/50"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};