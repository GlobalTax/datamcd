import React from 'react';
import { Button } from '@/components/ui/button';
import { QUICK_FILTER_OPTIONS, QuickFilterOption, AdvancedIncidentFilters } from '@/types/advancedFilters';

interface QuickFiltersProps {
  currentFilters: AdvancedIncidentFilters;
  onFiltersChange: (filters: AdvancedIncidentFilters) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  currentFilters,
  onFiltersChange
}) => {
  const handleQuickFilter = (option: QuickFilterOption) => {
    const newFilters = { ...currentFilters, ...option.filters };
    onFiltersChange(newFilters);
  };

  const isFilterActive = (option: QuickFilterOption) => {
    return Object.entries(option.filters).every(([key, value]) => {
      const currentValue = currentFilters[key as keyof AdvancedIncidentFilters];
      if (Array.isArray(value) && Array.isArray(currentValue)) {
        return value.every(v => (currentValue as any[]).includes(v));
      }
      return currentValue === value;
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="text-sm font-medium text-muted-foreground mb-2 w-full">
        Filtros rápidos:
      </div>
      {QUICK_FILTER_OPTIONS.map((option) => (
        <Button
          key={option.id}
          variant={isFilterActive(option) ? "default" : option.variant || "outline"}
          size="sm"
          onClick={() => handleQuickFilter(option)}
          className="transition-all duration-200"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};