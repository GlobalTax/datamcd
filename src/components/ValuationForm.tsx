
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Restaurant, ValuationFormData } from '@/types/restaurant';
import { calculateRestaurantValuation } from '@/utils/valuationCalculator';
import { Calculator, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ValuationFormProps {
  restaurant?: Restaurant;
  onSaveValuation?: (valuation: any) => void;
}

export function ValuationForm({ restaurant, onSaveValuation }: ValuationFormProps) {
  // Default restaurant data if none provided
  const defaultRestaurant = {
    id: 'default',
    name: 'Restaurante McDonald\'s',
    location: 'Ubicación por determinar'
  };

  const currentRestaurant = restaurant || defaultRestaurant;

  const [formData, setFormData] = useState<ValuationFormData>({
    valuationDate: new Date().toISOString().split('T')[0],
    initialSales: 2454919,
    salesGrowthRate: 3,
    inflationRate: 1.5,
    discountRate: 21,
    yearsRemaining: 20,
    pacPercentage: 32,
    rentPercentage: 11.47,
    serviceFeesPercentage: 5,
    depreciation: 72092,
    interest: 19997,
    loanPayment: 31478,
    rentIndex: 75925,
    miscellaneous: 85521
  });

  const [result, setResult] = useState<any>(null);

  const handleInputChange = (field: keyof ValuationFormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: field === 'valuationDate' ? value : numValue }));
  };

  const handleCalculate = () => {
    const calculationResult = calculateRestaurantValuation(formData);
    setResult(calculationResult);
  };

  const handleSave = () => {
    if (result && onSaveValuation) {
      onSaveValuation({
        ...formData,
        ...result,
        restaurantId: currentRestaurant.id,
        id: Date.now().toString(),
        createdAt: new Date(),
        createdBy: 'Usuario'
      });
      toast.success('Valoración guardada correctamente');
    } else if (result && !onSaveValuation) {
      toast.success('Valoración calculada correctamente');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Valoración de {currentRestaurant.name}</h2>
          <p className="text-gray-600">{currentRestaurant.location}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Datos para Valoración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valuationDate">Fecha de Valoración</Label>
              <Input
                id="valuationDate"
                type="date"
                value={formData.valuationDate}
                onChange={(e) => handleInputChange('valuationDate', e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">📊 Datos de Ventas (Datos en Verde)</h4>
              
              <div>
                <Label htmlFor="initialSales">Ventas Iniciales (€)</Label>
                <Input
                  id="initialSales"
                  type="number"
                  value={formData.initialSales}
                  onChange={(e) => handleInputChange('initialSales', e.target.value)}
                  className="bg-green-50 border-green-200"
                />
              </div>

              <div>
                <Label htmlFor="salesGrowthRate">Crecimiento Ventas (%)</Label>
                <Input
                  id="salesGrowthRate"
                  type="number"
                  step="0.1"
                  value={formData.salesGrowthRate}
                  onChange={(e) => handleInputChange('salesGrowthRate', e.target.value)}
                  className="bg-green-50 border-green-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">⚙️ Parámetros Financieros</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inflationRate">Inflación (%)</Label>
                  <Input
                    id="inflationRate"
                    type="number"
                    step="0.1"
                    value={formData.inflationRate}
                    onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="discountRate">Tasa Descuento (%)</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.1"
                    value={formData.discountRate}
                    onChange={(e) => handleInputChange('discountRate', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="yearsRemaining">Años Restantes Contrato</Label>
                <Input
                  id="yearsRemaining"
                  type="number"
                  value={formData.yearsRemaining}
                  onChange={(e) => handleInputChange('yearsRemaining', e.target.value)}
                  className="bg-green-50 border-green-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-purple-600">📈 Costos como % de Ventas</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pacPercentage">P.A.C. (%)</Label>
                  <Input
                    id="pacPercentage"
                    type="number"
                    step="0.1"
                    value={formData.pacPercentage}
                    onChange={(e) => handleInputChange('pacPercentage', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="rentPercentage">Alquiler (%)</Label>
                  <Input
                    id="rentPercentage"
                    type="number"
                    step="0.01"
                    value={formData.rentPercentage}
                    onChange={(e) => handleInputChange('rentPercentage', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceFeesPercentage">Service Fees (%)</Label>
                  <Input
                    id="serviceFeesPercentage"
                    type="number"
                    step="0.1"
                    value={formData.serviceFeesPercentage}
                    onChange={(e) => handleInputChange('serviceFeesPercentage', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600">💰 Costos Fijos Anuales (€)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depreciation">Depreciación</Label>
                  <Input
                    id="depreciation"
                    type="number"
                    value={formData.depreciation}
                    onChange={(e) => handleInputChange('depreciation', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="interest">Intereses</Label>
                  <Input
                    id="interest"
                    type="number"
                    value={formData.interest}
                    onChange={(e) => handleInputChange('interest', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="loanPayment">Pago Préstamo</Label>
                  <Input
                    id="loanPayment"
                    type="number"
                    value={formData.loanPayment}
                    onChange={(e) => handleInputChange('loanPayment', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="rentIndex">Índice Alquiler</Label>
                  <Input
                    id="rentIndex"
                    type="number"
                    value={formData.rentIndex}
                    onChange={(e) => handleInputChange('rentIndex', e.target.value)}
                    className="bg-green-50 border-green-200"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="miscellaneous">Gastos Diversos</Label>
                <Input
                  id="miscellaneous"
                  type="number"
                  value={formData.miscellaneous}
                  onChange={(e) => handleInputChange('miscellaneous', e.target.value)}
                  className="bg-green-50 border-green-200"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCalculate} className="flex-1">
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Valoración
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resultado de Valoración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(result.finalValuation)}
                </h3>
                <p className="text-green-700">Valoración Final del Restaurante</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Flujos de Caja Proyectados (primeros 5 años):</h4>
                {result.projectedCashFlows.slice(0, 5).map((cf: number, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Año {index + 1}</span>
                    <span className="font-semibold">{formatCurrency(cf)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Métricas Clave:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-blue-600 font-medium">Ventas Año 1</p>
                    <p className="text-lg font-bold">{formatCurrency(result.yearlyProjections[0]?.sales || 0)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-purple-600 font-medium">S.O.I. Año 1</p>
                    <p className="text-lg font-bold">{formatCurrency(result.yearlyProjections[0]?.soi || 0)}</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full" variant="default">
                Guardar Valoración
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
