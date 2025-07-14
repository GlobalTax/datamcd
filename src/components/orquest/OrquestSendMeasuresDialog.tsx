import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useOrquestMeasures } from '@/hooks/useOrquestMeasures';
import { OrquestService } from '@/types/orquest';
import { CalendarIcon } from 'lucide-react';

interface OrquestSendMeasuresDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: OrquestService[];
  franchiseeId?: string;
}

export const OrquestSendMeasuresDialog: React.FC<OrquestSendMeasuresDialogProps> = ({
  open,
  onOpenChange,
  services,
  franchiseeId
}) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [measureType, setMeasureType] = useState<string>('');
  const [periodFrom, setPeriodFrom] = useState<string>('');
  const [periodTo, setPeriodTo] = useState<string>('');
  
  const { sendMeasure, loading } = useOrquestMeasures(franchiseeId);

  const measureTypes = [
    { value: 'SALES', label: 'Ventas' },
    { value: 'LABOR_COST', label: 'Costos de Personal' },
    { value: 'FOOD_COST', label: 'Costos de Comida' },
    { value: 'OPERATING_EXPENSES', label: 'Gastos Operativos' },
    { value: 'NET_PROFIT', label: 'Beneficio Neto' },
  ];

  const handleSend = async () => {
    if (!selectedService || !measureType || !periodFrom || !periodTo) {
      return;
    }

    const result = await sendMeasure(selectedService, measureType, periodFrom, periodTo);
    
    if (result?.success) {
      onOpenChange(false);
      setSelectedService('');
      setMeasureType('');
      setPeriodFrom('');
      setPeriodTo('');
    }
  };

  const canSend = selectedService && measureType && periodFrom && periodTo && !loading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Medidas a Orquest</DialogTitle>
          <DialogDescription>
            Selecciona el servicio, tipo de medida y período para enviar datos de P&L a Orquest.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="service">Servicio</Label>
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

          <div className="grid gap-2">
            <Label htmlFor="measureType">Tipo de Medida</Label>
            <Select value={measureType} onValueChange={setMeasureType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de medida" />
              </SelectTrigger>
              <SelectContent>
                {measureTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="periodFrom">Fecha Desde</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={periodFrom}
                  onChange={(e) => setPeriodFrom(e.target.value)}
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="periodTo">Fecha Hasta</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={periodTo}
                  onChange={(e) => setPeriodTo(e.target.value)}
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={!canSend}>
            {loading ? 'Enviando...' : 'Enviar Medida'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};