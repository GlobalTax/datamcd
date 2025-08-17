import React from 'react';
import { cn } from '@/lib/utils';

interface HubKPIValueProps {
  value: number | null;
  type: 'currency' | 'percentage' | 'number' | 'hours';
  size?: 'sm' | 'md' | 'lg';
  trend?: number | null;
  suffix?: string;
  prefix?: string;
  placeholder?: string;
}

export const HubKPIValue: React.FC<HubKPIValueProps> = ({
  value,
  type,
  size = 'md',
  trend,
  suffix,
  prefix,
  placeholder = 'N/A'
}) => {
  const formatValue = (val: number | null): string => {
    if (val === null || val === undefined) return placeholder;
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
        
      case 'percentage':
        return `${val.toFixed(1)}%`;
        
      case 'hours':
        return `${Math.round(val)}h`;
        
      case 'number':
      default:
        return Math.round(val).toLocaleString('es-ES');
    }
  };

  const formatTrend = (trendValue: number): { text: string; color: string } => {
    const isPositive = trendValue > 0;
    const isGoodTrend = type === 'currency' || type === 'percentage' ? isPositive : !isPositive;
    
    return {
      text: `${isPositive ? '+' : ''}${trendValue.toFixed(1)}%`,
      color: isGoodTrend ? 'text-green-600' : 'text-red-600'
    };
  };

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold'
  };

  return (
    <div className="space-y-1">
      <div className={cn('text-foreground', sizeClasses[size])}>
        {prefix && <span className="text-muted-foreground text-sm mr-1">{prefix}</span>}
        {formatValue(value)}
        {suffix && <span className="text-muted-foreground text-sm ml-1">{suffix}</span>}
      </div>
      
      {trend !== null && trend !== undefined && value !== null && (
        <div className={cn(
          'text-xs font-medium',
          formatTrend(trend).color
        )}>
          {formatTrend(trend).text} vs mes anterior
        </div>
      )}
      
      {value === null && (
        <div className="text-xs text-muted-foreground">
          Sin datos disponibles
        </div>
      )}
    </div>
  );
};