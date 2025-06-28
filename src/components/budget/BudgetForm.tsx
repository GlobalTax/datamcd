
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ValuationBudgetFormData } from '@/types/budget';
import { BasicInfoSection } from './BasicInfoSection';
import { ValuationParametersSection } from './ValuationParametersSection';
import { CostPercentagesSection } from './CostPercentagesSection';
import { FixedCostsSection } from './FixedCostsSection';
import { NotesSection } from './NotesSection';

interface BudgetFormProps {
  restaurants: any[];
  onSubmit: (data: ValuationBudgetFormData) => Promise<void>;
  onCancel: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  restaurants,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ValuationBudgetFormData>({
    budget_name: '',
    budget_year: new Date().getFullYear(),
    franchisee_restaurant_id: '',
    initial_sales: 0,
    sales_growth_rate: 5,
    inflation_rate: 3,
    discount_rate: 10,
    years_projection: 5,
    pac_percentage: 30,
    rent_percentage: 10,
    service_fees_percentage: 4,
    depreciation: 50000,
    interest: 10000,
    loan_payment: 20000,
    rent_index: 5000,
    miscellaneous: 8000,
    notes: ''
  });

  const handleInputChange = (field: keyof ValuationBudgetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Nuevo Presupuesto de Valoración
        </h2>
        <p className="text-gray-600">
          Complete los datos para crear una nueva proyección financiera
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection
          formData={formData}
          restaurants={restaurants}
          onInputChange={handleInputChange}
        />

        <ValuationParametersSection
          formData={formData}
          onInputChange={handleInputChange}
        />

        <CostPercentagesSection
          formData={formData}
          onInputChange={handleInputChange}
        />

        <FixedCostsSection
          formData={formData}
          onInputChange={handleInputChange}
        />

        <NotesSection
          formData={formData}
          onInputChange={handleInputChange}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Crear Presupuesto
          </Button>
        </div>
      </form>
    </div>
  );
};
