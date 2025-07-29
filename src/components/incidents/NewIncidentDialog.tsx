import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CreateIncidentData } from "@/types/newIncident";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateIncidentData) => void;
  isLoading: boolean;
}

export const NewIncidentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: NewIncidentDialogProps) => {
  const [formData, setFormData] = useState<CreateIncidentData>({
    title: "",
    description: "",
    type: "general",
    priority: "medium",
    restaurant_id: "",
    assigned_to: "",
  });

  // Obtener restaurantes desde base_restaurants
  const { data: restaurants } = useQuery({
    queryKey: ["base-restaurants-for-incident"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_restaurants")
        .select("id, restaurant_name, site_number")
        .order("restaurant_name");

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

  // Limpiar formulario al abrir
  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        type: "general",
        priority: "medium",
        restaurant_id: "",
        assigned_to: "",
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle>Nueva Incidencia</DialogTitle>
          <DialogDescription>
            Crea una nueva incidencia patrimonial
          </DialogDescription>
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
                className="bg-background"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-background"
              />
            </div>

            <div>
              <Label htmlFor="restaurant">Restaurante *</Label>
              <Select
                value={formData.restaurant_id}
                onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
                required
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Seleccionar restaurante" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-[100] shadow-lg max-h-[200px] overflow-y-auto">
                  {restaurants?.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay restaurantes disponibles</div>
                  ) : (
                    restaurants?.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.restaurant_name} (#{restaurant.site_number})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-[100] shadow-lg">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="equipment">Equipamiento</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="safety">Seguridad</SelectItem>
                  <SelectItem value="hygiene">Higiene</SelectItem>
                  <SelectItem value="climatizacion">Climatización</SelectItem>
                  <SelectItem value="electricidad">Electricidad</SelectItem>
                  <SelectItem value="fontaneria">Fontanería</SelectItem>
                  <SelectItem value="obras">Obras</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="varios">Varios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-[100] shadow-lg">
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
                value={formData.assigned_to || ""}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-[100] shadow-lg max-h-[200px] overflow-y-auto">
                  <SelectItem value="">Sin asignar</SelectItem>
                  {users?.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No hay usuarios disponibles</div>
                  ) : (
                    users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Incidencia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};