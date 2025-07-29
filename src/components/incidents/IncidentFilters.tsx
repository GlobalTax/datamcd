import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { IncidentType, IncidentPriority, IncidentStatus } from "@/types/incident";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchableRestaurantSelect } from "@/components/ui/searchable-restaurant-select";

interface IncidentFiltersProps {
  filters: {
    status?: IncidentStatus;
    priority?: IncidentPriority;
    type?: IncidentType;
    restaurantId?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const IncidentFilters = ({ filters, onFiltersChange }: IncidentFiltersProps) => {
  // Obtener restaurantes para el filtro
  const { data: restaurants } = useQuery({
    queryKey: ["restaurants-for-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("franchisee_restaurants")
        .select(`
          id,
          base_restaurant:base_restaurants(
            restaurant_name,
            site_number
          )
        `)
        .order("base_restaurant(restaurant_name)");

      if (error) throw error;
      return data;
    },
  });

  const updateFilter = (key: string, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: undefined,
      priority: undefined,
      type: undefined,
      restaurantId: undefined,
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.type || filters.restaurantId;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchableRestaurantSelect
              restaurants={restaurants?.map(r => ({
                id: r.id,
                name: r.base_restaurant?.restaurant_name || 'Sin nombre',
                site_number: r.base_restaurant?.site_number || 'N/A'
              })) || []}
              value={filters.restaurantId || "all"}
              onValueChange={(value) => updateFilter("restaurantId", value)}
              includeAllOption
              allOptionLabel="Todos los restaurantes"
              placeholder="Buscar restaurante..."
              compact
            />
          </div>

          <div className="min-w-[150px]">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="open">Abierta</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="resolved">Resuelta</SelectItem>
                <SelectItem value="closed">Cerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <Select
              value={filters.priority || "all"}
              onValueChange={(value) => updateFilter("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => updateFilter("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="equipment">Equipamiento</SelectItem>
                <SelectItem value="staff">Personal</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="safety">Seguridad</SelectItem>
                <SelectItem value="hygiene">Higiene</SelectItem>
                <SelectItem value="climatizacion">Climatización</SelectItem>
                <SelectItem value="electricidad">Electricidad</SelectItem>
                <SelectItem value="fontaneria">Fontanería</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="obras">Obras</SelectItem>
                <SelectItem value="limpieza">Limpieza</SelectItem>
                <SelectItem value="varios">Varios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};