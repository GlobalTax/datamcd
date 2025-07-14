import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Download, Loader2 } from 'lucide-react';
import { useOrquestMeasuresReceived } from '@/hooks/useOrquestMeasuresReceived';
import { OrquestService } from '@/types/orquest';
import { toast } from '@/hooks/use-toast';

interface OrquestFetchMeasuresDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: OrquestService[];
  franchiseeId?: string;
}

const DEMAND_TYPES = [
  { id: 'SALES', label: 'Ventas', checked: true },
  { id: 'TICKETS', label: 'Tickets', checked: true },
  { id: 'FOOTFALL', label: 'Afluencia', checked: false },
];

export const OrquestFetchMeasuresDialog: React.FC<OrquestFetchMeasuresDialogProps> = ({
  open,
  onOpenChange,
  services,
  franchiseeId
}) => {
  const [selectedService, setSelectedService] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [demandTypes, setDemandTypes] = useState<string[]>(['SALES', 'TICKETS']);

  const { fetchMeasuresFromOrquest, loading } = useOrquestMeasuresReceived(franchiseeId);

  const handleDemandTypeChange = (typeId: string, checked: boolean) => {
    setDemandTypes(prev => 
      checked 
        ? [...prev, typeId]
        : prev.filter(id => id !== typeId)
    );
  };

  const handleSubmit = async () => {
    if (!selectedService || !startDate || !endDate) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    if (demandTypes.length === 0) {
      toast({
        title: 'Tipos de medida requeridos',
        description: 'Selecciona al menos un tipo de medida.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await fetchMeasuresFromOrquest(
        selectedService,
        startDate,
        endDate,
        demandTypes
      );

      if (result?.success) {
        toast({
          title: 'Medidas obtenidas',
          description: `Se obtuvieron ${result.measures_fetched} medidas de Orquest correctamente.`,
        });
        onOpenChange(false);
      } else {
        throw new Error(result?.error || 'Error desconocido');
      }
    } catch (error) {
      toast({
        title: 'Error al obtener medidas',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedService('');
    setStartDate('');
    setEndDate('');
    setDemandTypes(['SALES', 'TICKETS']);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Obtener Medidas de Orquest
          </DialogTitle>
          <DialogDescription>
            Obtén medidas reales desde Orquest para análisis y comparación.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="service">Servicio *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.nombre || service.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha Inicio *</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha Fin *</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Tipos de Medida</Label>
            <div className="space-y-2">
              {DEMAND_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={demandTypes.includes(type.id)}
                    onCheckedChange={(checked) => 
                      handleDemandTypeChange(type.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={type.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedService || !startDate || !endDate}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Obtener Medidas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};