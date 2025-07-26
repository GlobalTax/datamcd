import React, { useState, useMemo } from 'react';
import { Search, X, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface RestaurantOption {
  id: string;
  name: string;
  site_number: string;
  franchisee_name?: string;
  // Support for nested structure from franchisee_restaurants
  base_restaurant?: {
    restaurant_name: string;
    site_number: string;
  };
}

interface SearchableRestaurantSelectProps {
  restaurants: RestaurantOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  // For compact mode (no card wrapper)
  compact?: boolean;
}

export const SearchableRestaurantSelect = ({
  restaurants,
  value,
  onValueChange,
  placeholder = "Buscar restaurante...",
  includeAllOption = false,
  allOptionLabel = "Todos los restaurantes",
  loading = false,
  disabled = false,
  className,
  compact = false
}: SearchableRestaurantSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Normalize restaurant data to handle different structures
  const normalizedRestaurants = useMemo(() => {
    return restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name || restaurant.base_restaurant?.restaurant_name || '',
      site_number: restaurant.site_number || restaurant.base_restaurant?.site_number || 'N/A',
      franchisee_name: restaurant.franchisee_name || ''
    }));
  }, [restaurants]);

  // Filter restaurants based on search term
  const filteredRestaurants = useMemo(() => {
    if (!searchTerm.trim()) return normalizedRestaurants;
    
    const term = searchTerm.toLowerCase();
    return normalizedRestaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.site_number.toLowerCase().includes(term) ||
      (restaurant.franchisee_name && restaurant.franchisee_name.toLowerCase().includes(term))
    );
  }, [normalizedRestaurants, searchTerm]);

  // Get selected restaurant info
  const selectedRestaurant = normalizedRestaurants.find(r => r.id === value);
  const isAllSelected = value === "all";

  // Handle selection
  const handleSelect = (restaurantId: string) => {
    onValueChange(restaurantId);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Display value in the trigger
  const displayValue = () => {
    if (isAllSelected && includeAllOption) {
      return allOptionLabel;
    }
    if (selectedRestaurant) {
      return `${selectedRestaurant.name} (#${selectedRestaurant.site_number})`;
    }
    return placeholder;
  };

  const triggerContent = (
    <div className="relative">
      <Button
        variant="outline"
        className={cn(
          "w-full justify-between text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {loading ? "Cargando..." : displayValue()}
          </span>
        </div>
        <Search className="h-4 w-4 shrink-0" />
      </Button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-3">
            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Options */}
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {/* All option */}
                {includeAllOption && (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent",
                      isAllSelected && "bg-accent"
                    )}
                    onClick={() => handleSelect("all")}
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{allOptionLabel}</span>
                  </div>
                )}

                {/* Restaurant options */}
                {filteredRestaurants.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {normalizedRestaurants.length === 0 
                      ? "No hay restaurantes disponibles" 
                      : "No se encontraron restaurantes"
                    }
                  </div>
                ) : (
                  filteredRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent",
                        restaurant.id === value && "bg-accent"
                      )}
                      onClick={() => handleSelect(restaurant.id)}
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          #{restaurant.site_number}
                          {restaurant.franchisee_name && (
                            <span> • {restaurant.franchisee_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-searchable-restaurant-select]')) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (compact) {
    return (
      <div data-searchable-restaurant-select className="relative">
        {triggerContent}
      </div>
    );
  }

  return (
    <div data-searchable-restaurant-select className="relative">
      {triggerContent}
    </div>
  );
};