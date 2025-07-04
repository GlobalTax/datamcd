import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingFallbackProps {
  message?: string;
  variant?: 'page' | 'card' | 'inline';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Cargando...', 
  variant = 'page' 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );

  switch (variant) {
    case 'page':
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          {content}
        </div>
      );
    case 'card':
      return (
        <Card>
          <CardContent className="p-8">
            {content}
          </CardContent>
        </Card>
      );
    case 'inline':
      return content;
    default:
      return content;
  }
};

// Skeleton loader para tablas
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div 
            key={j} 
            className="h-4 bg-muted rounded animate-pulse flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);

// Skeleton para cards
export const CardSkeleton: React.FC = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
        </div>
      </div>
    </CardContent>
  </Card>
);