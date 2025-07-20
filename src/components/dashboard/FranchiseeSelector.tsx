
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Users } from 'lucide-react';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

export const FranchiseeSelector: React.FC = () => {
  const { 
    selectedFranchisee, 
    availableFranchisees, 
    setSelectedFranchisee, 
    isLoading, 
    canSelectFranchisee 
  } = useFranchiseeContext();

  if (!canSelectFranchisee) {
    // Para franquiciados normales, mostrar solo información sin selector
    if (selectedFranchisee) {
      return (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{selectedFranchisee.franchisee_name}</span>
            <span className="text-xs text-muted-foreground">
              {selectedFranchisee.total_restaurants} restaurantes
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-muted rounded" />
        <div className="w-32 h-4 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Select 
        value={selectedFranchisee?.id || ''} 
        onValueChange={(value) => {
          const franchisee = availableFranchisees.find(f => f.id === value);
          setSelectedFranchisee(franchisee || null);
        }}
      >
        <SelectTrigger className="w-64">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <SelectValue placeholder="Seleccionar franquiciado" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableFranchisees.map((franchisee) => (
            <SelectItem key={franchisee.id} value={franchisee.id}>
              <div className="flex items-center justify-between w-full">
                <span>{franchisee.franchisee_name}</span>
                <Badge variant="secondary" className="ml-2">
                  {franchisee.total_restaurants} rest.
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedFranchisee && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{selectedFranchisee.total_restaurants} restaurantes</span>
        </div>
      )}
    </div>
  );
};
