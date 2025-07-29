import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Save, 
  Trash2, 
  Settings,
  X 
} from 'lucide-react';
import { QuickFilters } from './QuickFilters';
import { useFilterPresets } from '@/hooks/useFilterPresets';
import { AdvancedIncidentFilters, DATE_PRESETS } from '@/types/advancedFilters';
import { IncidentType, IncidentPriority, IncidentStatus } from '@/types/newIncident';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const filterSchema = z.object({
  search: z.string().optional(),
  restaurantName: z.string().optional(),
  providerName: z.string().optional(),
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  datePreset: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

interface AdvancedIncidentFiltersComponentProps {
  filters: AdvancedIncidentFilters;
  onFiltersChange: (filters: AdvancedIncidentFilters) => void;
}

export const AdvancedIncidentFilters: React.FC<AdvancedIncidentFiltersComponentProps> = ({
  filters,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  
  const { 
    savedPresets, 
    currentPreset, 
    savePreset, 
    deletePreset, 
    loadPreset,
    clearCurrentPreset 
  } = useFilterPresets();

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: filters.search || '',
      restaurantName: filters.restaurantName || '',
      providerName: filters.providerName || '',
      status: filters.status || [],
      priority: filters.priority || [],
      type: filters.type || [],
      datePreset: filters.datePreset || 'custom',
      dateFrom: filters.date_from || '',
      dateTo: filters.date_to || '',
    }
  });

  // Obtener restaurantes
  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('base_restaurants')
        .select('id, restaurant_name')
        .order('restaurant_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Obtener proveedores
  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('contact_type', 'provider')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = (data: z.infer<typeof filterSchema>) => {
    const newFilters: AdvancedIncidentFilters = {
      ...filters,
      ...data,
    };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: AdvancedIncidentFilters = {};
    form.reset();
    onFiltersChange(emptyFilters);
    clearCurrentPreset();
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      const currentFilters = form.getValues();
      savePreset(presetName, { ...filters, ...currentFilters });
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadPreset = (preset: any) => {
    const loadedFilters = loadPreset(preset);
    form.reset(loadedFilters);
    onFiltersChange(loadedFilters);
  };

  const getActiveFiltersCount = () => {
    const values = form.getValues();
    return Object.entries(values).filter(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== '' && value !== 'custom';
    }).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de búsqueda
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {currentPreset && (
              <Badge variant="outline" className="flex items-center gap-1">
                {currentPreset.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={clearCurrentPreset}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <QuickFilters 
          currentFilters={filters}
          onFiltersChange={onFiltersChange}
        />

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Búsqueda principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Búsqueda general</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar en título, descripción..."
                      className="pl-10"
                      {...form.register('search')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant">Restaurante</Label>
                  <Select
                    value={form.watch('restaurantName') || ''}
                    onValueChange={(value) => form.setValue('restaurantName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar restaurante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los restaurantes</SelectItem>
                      {restaurants?.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.restaurant_name}>
                          {restaurant.restaurant_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="provider">Proveedor</Label>
                  <Select
                    value={form.watch('providerName') || ''}
                    onValueChange={(value) => form.setValue('providerName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los proveedores</SelectItem>
                      {providers?.map((provider) => (
                        <SelectItem key={provider.id} value={provider.name}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtros de estado, prioridad y tipo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Estado</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(['open', 'in_progress', 'resolved'] as IncidentStatus[]).map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={form.watch('status')?.includes(status) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = form.watch('status') || [];
                          const updated = current.includes(status)
                            ? current.filter(s => s !== status)
                            : [...current, status];
                          form.setValue('status', updated);
                        }}
                      >
                        {status === 'open' ? 'Abierto' : 
                         status === 'in_progress' ? 'En progreso' : 'Resuelto'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Prioridad</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(['low', 'medium', 'high', 'critical'] as IncidentPriority[]).map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={form.watch('priority')?.includes(priority) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = form.watch('priority') || [];
                          const updated = current.includes(priority)
                            ? current.filter(p => p !== priority)
                            : [...current, priority];
                          form.setValue('priority', updated);
                        }}
                      >
                        {priority === 'low' ? 'Baja' : 
                         priority === 'medium' ? 'Media' : 
                         priority === 'high' ? 'Alta' : 'Crítica'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tipo</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(['general', 'equipment', 'staff', 'customer', 'safety'] as IncidentType[]).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={form.watch('type')?.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = form.watch('type') || [];
                          const updated = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          form.setValue('type', updated);
                        }}
                      >
                        {type === 'general' ? 'General' : 
                         type === 'safety' ? 'Seguridad' : 
                         type === 'equipment' ? 'Equipamiento' : 
                         type === 'staff' ? 'Personal' : 'Cliente'}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtros de fecha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Rango de fechas</Label>
                  <Select
                    value={form.watch('datePreset') || 'custom'}
                    onValueChange={(value) => form.setValue('datePreset', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_PRESETS.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.watch('datePreset') === 'custom' && (
                  <>
                    <div>
                      <Label htmlFor="dateFrom">Desde</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        {...form.register('dateFrom')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateTo">Hasta</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        {...form.register('dateTo')}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Filtros guardados */}
              {savedPresets.length > 0 && (
                <div>
                  <Label>Filtros guardados</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {savedPresets.map((preset) => (
                      <div key={preset.id} className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadPreset(preset)}
                        >
                          {preset.name}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => deletePreset(preset.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Aplicar filtros
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearAllFilters}
                  >
                    Limpiar todo
                  </Button>
                </div>

                <div className="flex gap-2">
                  {!showSaveDialog ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSaveDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Guardar filtros
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nombre del filtro"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                      >
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowSaveDialog(false);
                          setPresetName('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};