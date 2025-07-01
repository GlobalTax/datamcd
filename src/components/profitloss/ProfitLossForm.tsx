
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfitLossData } from '@/hooks/useProfitLossData';
import { ProfitLossFormData } from '@/types/profitLoss';
import { Save } from 'lucide-react';
import { ProfitLossFormHeader } from './form/ProfitLossFormHeader';
import { RevenueSection } from './form/RevenueSection';
import { CostOfSalesSection } from './form/CostOfSalesSection';
import { LaborCostsSection } from './form/LaborCostsSection';
import { OperatingExpensesSection } from './form/OperatingExpensesSection';
import { McDonaldsFeesSection } from './form/McDonaldsFeesSection';
import { FormSummary } from './form/FormSummary';
import { showSuccess, showError } from '@/utils/notifications';

interface ProfitLossFormProps {
  restaurantId: string;
  onClose: () => void;
  editData?: any;
}

export const ProfitLossForm = ({ restaurantId, onClose, editData }: ProfitLossFormProps) => {
  const { saveData } = useProfitLossData(restaurantId);
  
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
      // Calcular campos derivados
      const totalRevenue = formData.net_sales + formData.other_revenue;
      const totalCostOfSales = formData.food_cost + formData.paper_cost;
      const totalLabor = formData.management_labor + formData.crew_labor + formData.benefits;
      const totalOperatingExpenses = formData.rent + formData.utilities + formData.maintenance + 
                                     formData.advertising + formData.insurance + formData.supplies + formData.other_expenses;
      const totalMcDonaldsFees = formData.franchise_fee + formData.advertising_fee + formData.rent_percentage;
      const grossProfit = totalRevenue - totalCostOfSales;
      const operatingIncome = totalRevenue - totalCostOfSales - totalLabor - totalOperatingExpenses - totalMcDonaldsFees;

      const dataToSave = {
        id: editData?.id || crypto.randomUUID(),
        restaurant_id: formData.restaurant_id,
        year: formData.year,
        month: formData.month,
        net_sales: formData.net_sales,
        other_revenue: formData.other_revenue,
        total_revenue: totalRevenue,
        food_cost: formData.food_cost,
        paper_cost: formData.paper_cost,
        total_cost_of_sales: totalCostOfSales,
        management_labor: formData.management_labor,
        crew_labor: formData.crew_labor,
        benefits: formData.benefits,
        total_labor: totalLabor,
        rent: formData.rent,
        utilities: formData.utilities,
        maintenance: formData.maintenance,
        advertising: formData.advertising,
        insurance: formData.insurance,
        supplies: formData.supplies,
        other_expenses: formData.other_expenses,
        total_operating_expenses: totalOperatingExpenses,
        franchise_fee: formData.franchise_fee,
        advertising_fee: formData.advertising_fee,
        rent_percentage: formData.rent_percentage,
        total_mcdonalds_fees: totalMcDonaldsFees,
        gross_profit: grossProfit,
        operating_income: operatingIncome,
        notes: formData.notes,
        created_at: editData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: undefined
      };

      await saveData([dataToSave]);
      showSuccess('Datos guardados correctamente');
      onClose();
    } catch (error) {
      console.error('Error saving P&L data:', error);
      showError('Error al guardar los datos');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfitLossFormHeader
        formData={formData}
        operatingIncome={operatingIncome}
        onInputChange={handleInputChange}
      />

      <RevenueSection
        formData={formData}
        totalRevenue={totalRevenue}
        onInputChange={handleInputChange}
      />

      <CostOfSalesSection
        formData={formData}
        totalCostOfSales={totalCostOfSales}
        onInputChange={handleInputChange}
      />

      <LaborCostsSection
        formData={formData}
        totalLabor={totalLabor}
        onInputChange={handleInputChange}
      />

      <OperatingExpensesSection
        formData={formData}
        totalOperatingExpenses={totalOperatingExpenses}
        onInputChange={handleInputChange}
      />

      <McDonaldsFeesSection
        formData={formData}
        totalMcDonaldsFees={totalMcDonaldsFees}
        onInputChange={handleInputChange}
      />

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

      <FormSummary
        totalRevenue={totalRevenue}
        grossProfit={grossProfit}
        operatingIncome={operatingIncome}
      />

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
