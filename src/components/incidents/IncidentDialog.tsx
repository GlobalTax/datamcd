import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateIncidentData, UpdateIncidentData, IncidentType, IncidentPriority } from "@/types/incident";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateIncidentData | UpdateIncidentData) => void;
  isLoading: boolean;
  incident?: any; // Para edición
}

export const IncidentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  incident,
}: IncidentDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    incident_type: "general" as IncidentType,
    priority: "medium" as IncidentPriority,
    restaurant_id: "",
    assigned_to: "",
    estimated_resolution: "",
  });

  // Obtener restaurantes
  const { data: restaurants } = useQuery({
    queryKey: ["restaurants-for-incident"],
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

  // Obtener usuarios para asignación
  const { data: users } = useQuery({
    queryKey: ["users-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  // Inicializar formulario al abrir para edición
  useEffect(() => {
    if (incident && open) {
      setFormData({
        title: incident.title || "",
        description: incident.description || "",
        incident_type: (incident.incident_type || "general") as IncidentType,
        priority: (incident.priority || "medium") as IncidentPriority,
        restaurant_id: incident.restaurant_id || "",
        assigned_to: incident.assigned_to || "",
        estimated_resolution: incident.estimated_resolution || "",
      });
    } else if (!incident && open) {
      // Limpiar formulario para nueva incidencia
      setFormData({
        title: "",
        description: "",
        incident_type: "general" as IncidentType,
        priority: "medium" as IncidentPriority,
        restaurant_id: "",
        assigned_to: "",
        estimated_resolution: "",
      });
    }
  }, [incident, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {incident ? "Editar Incidencia" : "Nueva Incidencia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="restaurant">Restaurante *</Label>
              <Select
                value={formData.restaurant_id}
                onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar restaurante" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants?.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.base_restaurant?.restaurant_name} (#
                      {restaurant.base_restaurant?.site_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.incident_type}
                onValueChange={(value) => setFormData({ ...formData, incident_type: value as IncidentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="equipment">Equipamiento</SelectItem>
                  <SelectItem value="staff">Personal</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="safety">Seguridad</SelectItem>
                  <SelectItem value="hygiene">Higiene</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as IncidentPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigned">Asignar a</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="estimated_resolution">Fecha estimada de resolución</Label>
              <Input
                id="estimated_resolution"
                type="date"
                value={formData.estimated_resolution}
                onChange={(e) => setFormData({ ...formData, estimated_resolution: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : incident ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};