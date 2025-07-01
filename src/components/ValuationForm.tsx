import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/notifications';

interface ValuationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

interface FormData {
  restaurantName?: string;
  year?: number;
  revenue?: number;
  expenses?: number;
  // Add more fields as needed
}

const ValuationForm = ({ onSubmit, initialData }: ValuationFormProps) => {
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!formData.restaurantName || !formData.year || !formData.revenue || !formData.expenses) {
        showError('Por favor completa todos los campos');
        return;
      }
      
      await onSubmit(formData);
      showSuccess('Valoración guardada correctamente');
    } catch (error) {
      console.error('Error submitting valuation:', error);
      showError('Error al guardar la valoración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Valoración</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                Nombre del Restaurante
              </label>
              <Input
                type="text"
                id="restaurantName"
                name="restaurantName"
                value={formData.restaurantName || ''}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Año
              </label>
              <Input
                type="number"
                id="year"
                name="year"
                value={formData.year || ''}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">
                Ingresos
              </label>
              <Input
                type="number"
                id="revenue"
                name="revenue"
                value={formData.revenue || ''}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="expenses" className="block text-sm font-medium text-gray-700">
                Gastos
              </label>
              <Input
                type="number"
                id="expenses"
                name="expenses"
                value={formData.expenses || ''}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <Button disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Valoración'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ValuationForm;
