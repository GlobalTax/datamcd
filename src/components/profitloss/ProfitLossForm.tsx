
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfitLossData } from '@/hooks/useProfitLossData';
import { ProfitLossFormData } from '@/types/profitLoss';
import { Save, Calculator } from 'lucide-react';

interface ProfitLossFormProps {
  restaurantId: string;
  onClose: () => void;
  editData?: any;
}

export const ProfitLossForm = ({ restaurantId, onClose, editData }: ProfitLossFormProps) => {
  const { createProfitLossData, updateProfitLossData } = useProfitLossData();
  
  const [formData, setFormData] = useState<ProfitLossFormData>({
    restaurant_id: restaurantId,
    year: editData?.year || new Date().getFullYear(),
    month: editData?.month || new Date().getMonth() + 1,
    net_sales: editData?.net_sales || 0,
    other_revenue: editData?.other_revenue || 0,
    food_cost: editData?.food_cost || 0,
    paper_cost: editData?.paper_cost || 0,
    management_labor: editData?.management_labor || 0,
    crew_labor: editData?.crew_labor || 0,
    benefits: editData?.benefits || 0,
    rent: editData?.rent || 0,
    utilities: editData?.utilities || 0,
    maintenance: editData?.maintenance || 0,
    advertising: editData?.advertising || 0,
    insurance: editData?.insurance || 0,
    supplies: editData?.supplies || 0,
    other_expenses: editData?.other_expenses || 0,
    franchise_fee: editData?.franchise_fee || 0,
    advertising_fee: editData?.advertising_fee || 0,
    rent_percentage: editData?.rent_percentage || 0,
    notes: editData?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ProfitLossFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'notes' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editData) {
        await updateProfitLossData.mutateAsync({ ...formData, id: editData.id });
      } else {
        await createProfitLossData.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving P&L data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular totales en tiempo real
  const totalRevenue = formData.net_sales + formData.other_revenue;
  const totalCostOfSales = formData.food_cost + formData.paper_cost;
  const totalLabor = formData.management_labor + formData.crew_labor + formData.benefits;
  const totalOperatingExpenses = formData.rent + formData.utilities + formData.maintenance + 
                                 formData.advertising + formData.insurance + formData.supplies + formData.other_expenses;
  const totalMcDonaldsFees = formData.franchise_fee + formData.advertising_fee + formData.rent_percentage;
  const grossProfit = totalRevenue - totalCostOfSales;
  const operatingIncome = totalRevenue - totalCostOfSales - totalLabor - totalOperatingExpenses - totalMcDonaldsFees;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="year">Año</Label>
          <Select value={formData.year.toString()} onValueChange={(value) => handleInputChange('year',
parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="month">Mes</Label>
          <Select value={formData.month.toString()} onValueChange={(value) => handleInputChange('month', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Card className="w-full">
            <CardContent className="p-3">
              <div className="text-sm text-gray-600">Beneficio Operativo</div>
              <div className={`text-lg font-bold ${operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{operatingIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-700">Ingresos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="net_sales">Ventas Netas</Label>
            <Input
              id="net_sales"
              type="number"
              step="0.01"
              value={formData.net_sales}
              onChange={(e) => handleInputChange('net_sales', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="other_revenue">Otros Ingresos</Label>
            <Input
              id="other_revenue"
              type="number"
              step="0.01"
              value={formData.other_revenue}
              onChange={(e) => handleInputChange('other_revenue', e.target.value)}
            />
          </div>
          <div className="col-span-2 bg-green-50 p-3 rounded">
            <strong>Total Ingresos: €{totalRevenue.toLocaleString()}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Cost of Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-700">Costo de Ventas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="food_cost">Costo Comida</Label>
            <Input
              id="food_cost"
              type="number"
              step="0.01"
              value={formData.food_cost}
              onChange={(e) => handleInputChange('food_cost', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="paper_cost">Costo Papel/Envases</Label>
            <Input
              id="paper_cost"
              type="number"
              step="0.01"
              value={formData.paper_cost}
              onChange={(e) => handleInputChange('paper_cost', e.target.value)}
            />
          </div>
          <div className="col-span-2 bg-red-50 p-3 rounded">
            <strong>Total Costo Ventas: €{totalCostOfSales.toLocaleString()}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Labor Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-orange-700">Costos de Mano de Obra</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="management_labor">Mano de Obra Gerencial</Label>
            <Input
              id="management_labor"
              type="number"
              step="0.01"
              value={formData.management_labor}
              onChange={(e) => handleInputChange('management_labor', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="crew_labor">Mano de Obra Equipo</Label>
            <Input
              id="crew_labor"
              type="number"
              step="0.01"
              value={formData.crew_labor}
              onChange={(e) => handleInputChange('crew_labor', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="benefits">Beneficios/Seguros</Label>
            <Input
              id="benefits"
              type="number"
              step="0.01"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
            />
          </div>
          <div className="col-span-3 bg-orange-50 p-3 rounded">
            <strong>Total Mano de Obra: €{totalLabor.toLocaleString()}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Operating Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700">Gastos Operativos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rent">Alquiler</Label>
            <Input
              id="rent"
              type="number"
              step="0.01"
              value={formData.rent}
              onChange={(e) => handleInputChange('rent', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="utilities">Servicios Públicos</Label>
            <Input
              id="utilities"
              type="number"
              step="0.01"
              value={formData.utilities}
              onChange={(e) => handleInputChange('utilities', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maintenance">Mantenimiento</Label>
            <Input
              id="maintenance"
              type="number"
              step="0.01"
              value={formData.maintenance}
              onChange={(e) => handleInputChange('maintenance', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="advertising">Publicidad Local</Label>
            <Input
              id="advertising"
              type="number"
              step="0.01"
              value={formData.advertising}
              onChange={(e) => handleInputChange('advertising', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="insurance">Seguros</Label>
            <Input
              id="insurance"
              type="number"
              step="0.01"
              value={formData.insurance}
              onChange={(e) => handleInputChange('insurance', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="supplies">Suministros</Label>
            <Input
              id="supplies"
              type="number"
              step="0.01"
              value={formData.supplies}
              onChange={(e) => handleInputChange('supplies', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="other_expenses">Otros Gastos</Label>
            <Input
              id="other_expenses"
              type="number"
              step="0.01"
              value={formData.other_expenses}
              onChange={(e) => handleInputChange('other_expenses', e.target.value)}
            />
          </div>
          <div className="col-span-3 bg-blue-50 p-3 rounded">
            <strong>Total Gastos Operativos: €{totalOperatingExpenses.toLocaleString()}</strong>
          </div>
        </CardContent>
      </Card>

      {/* McDonald's Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-yellow-700">Fees McDonald's</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="franchise_fee">Fee Franquicia</Label>
            <Input
              id="franchise_fee"
              type="number"
              step="0.01"
              value={formData.franchise_fee}
              onChange={(e) => handleInputChange('franchise_fee', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="advertising_fee">Fee Publicidad</Label>
            <Input
              id="advertising_fee"
              type="number"
              step="0.01"
              value={formData.advertising_fee}
              onChange={(e) => handleInputChange('advertising_fee', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rent_percentage">% Alquiler Ventas</Label>
            <Input
              id="rent_percentage"
              type="number"
              step="0.01"
              value={formData.rent_percentage}
              onChange={(e) => handleInputChange('rent_percentage', e.target.value)}
            />
          </div>
          <div className="col-span-3 bg-yellow-50 p-3 rounded">
            <strong>Total Fees McDonald's: €{totalMcDonaldsFees.toLocaleString()}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Comentarios adicionales sobre este mes..."
          rows={3}
        />
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Resumen Calculado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ingresos Totales:</span>
                <span className="font-semibold">€{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Beneficio Bruto:</span>
                <span className="font-semibold">€{grossProfit.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Margen Bruto:</span>
                <span className="font-semibold">
                  {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                  Beneficio Operativo:
                </span>
                <span className={`font-bold ${operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{operatingIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Guardando...' : editData ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};
