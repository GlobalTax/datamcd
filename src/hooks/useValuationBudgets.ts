
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ValuationBudget, ValuationBudgetFormData, ValuationBudgetUpdateData, ProjectedYear } from '@/types/budget';
import { toast } from 'sonner';

export const useValuationBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<ValuationBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    console.log('fetchBudgets - Starting fetch, user:', user);
    
    if (!user) {
      console.log('fetchBudgets - No user found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('fetchBudgets - Making Supabase query for valuation budgets');
      
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('valuation_budgets')
        .select(`
          *,
          franchisee_restaurants!inner(
            id,
            base_restaurants(restaurant_name, site_number),
            franchisees!inner(
              franchisee_name,
              user_id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError);
        setError(`Error al cargar los presupuestos: ${budgetsError.message}`);
        toast.error('Error al cargar los presupuestos: ' + budgetsError.message);
        setLoading(false);
        return;
      }

      console.log('fetchBudgets - Raw data from Supabase:', budgetsData);
      
      // Transformar los datos para manejar el tipo Json de projected_cash_flows
      const transformedBudgets = (budgetsData || []).map(budget => ({
        ...budget,
        projected_cash_flows: Array.isArray(budget.projected_cash_flows) 
          ? budget.projected_cash_flows 
          : budget.projected_cash_flows ? JSON.parse(budget.projected_cash_flows as string) : []
      })) as ValuationBudget[];

      console.log('fetchBudgets - Setting budgets data:', transformedBudgets);
      setBudgets(transformedBudgets);
      
      if (!transformedBudgets || transformedBudgets.length === 0) {
        console.log('fetchBudgets - No budgets found in database');
        toast.info('No se encontraron presupuestos de valoración');
      } else {
        console.log(`fetchBudgets - Found ${transformedBudgets.length} budgets`);
        toast.success(`Se cargaron ${transformedBudgets.length} presupuestos`);
      }
    } catch (err) {
      console.error('Error in fetchBudgets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los presupuestos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData: ValuationBudgetFormData): Promise<boolean> => {
    try {
      console.log('Creating budget with data:', budgetData);

      // Calcular proyecciones
      const projectedYears = calculateProjections(budgetData);
      const finalValuation = projectedYears.reduce((sum, year) => sum + year.present_value, 0);
      const projectedCashFlows = projectedYears.map(year => year.cash_flow);

      const { error } = await supabase
        .from('valuation_budgets')
        .insert({
          ...budgetData,
          final_valuation: finalValuation,
          projected_cash_flows: projectedCashFlows,
          created_by: user?.id
        });

      if (error) {
        console.error('Error creating budget:', error);
        toast.error('Error al crear el presupuesto: ' + error.message);
        return false;
      }

      toast.success('Presupuesto creado correctamente');
      fetchBudgets(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error creating budget:', err);
      toast.error('Error al crear el presupuesto');
      return false;
    }
  };

  const updateBudget = async (id: string, budgetData: ValuationBudgetUpdateData): Promise<boolean> => {
    try {
      console.log('Updating budget with id:', id, 'data:', budgetData);

      // Recalcular proyecciones si se han cambiado parámetros financieros
      let updateData = { ...budgetData };
      
      if (shouldRecalculate(budgetData)) {
        const fullBudget = budgets.find(b => b.id === id);
        if (fullBudget) {
          const mergedData = { ...fullBudget, ...budgetData } as ValuationBudgetFormData;
          const projectedYears = calculateProjections(mergedData);
          updateData.final_valuation = projectedYears.reduce((sum, year) => sum + year.present_value, 0);
          updateData.projected_cash_flows = projectedYears.map(year => year.cash_flow);
        }
      }

      const { error } = await supabase
        .from('valuation_budgets')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating budget:', error);
        toast.error('Error al actualizar el presupuesto: ' + error.message);
        return false;
      }

      toast.success('Presupuesto actualizado correctamente');
      fetchBudgets(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error updating budget:', err);
      toast.error('Error al actualizar el presupuesto');
      return false;
    }
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('valuation_budgets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget:', error);
        toast.error('Error al eliminar el presupuesto: ' + error.message);
        return false;
      }

      toast.success('Presupuesto eliminado correctamente');
      fetchBudgets(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error deleting budget:', err);
      toast.error('Error al eliminar el presupuesto');
      return false;
    }
  };

  // Función para calcular proyecciones financieras
  const calculateProjections = (data: ValuationBudgetFormData): ProjectedYear[] => {
    const projections: ProjectedYear[] = [];
    
    for (let year = 1; year <= data.years_projection; year++) {
      const adjustedSales = data.initial_sales * Math.pow(1 + data.sales_growth_rate / 100, year);
      const inflationFactor = Math.pow(1 + data.inflation_rate / 100, year);
      
      const pac = adjustedSales * (data.pac_percentage / 100);
      const rent = adjustedSales * (data.rent_percentage / 100);
      const serviceFees = adjustedSales * (data.service_fees_percentage / 100);
      
      const fixedCosts = (data.depreciation + data.interest + data.loan_payment + 
                         data.rent_index + data.miscellaneous) * inflationFactor;
      
      const totalCosts = pac + rent + serviceFees + fixedCosts;
      const netIncome = adjustedSales - totalCosts;
      const cashFlow = netIncome + (data.depreciation * inflationFactor); // Add back depreciation as it's non-cash
      
      const presentValue = cashFlow / Math.pow(1 + data.discount_rate / 100, year);
      
      projections.push({
        year: new Date().getFullYear() + year,
        sales: adjustedSales,
        pac,
        rent,
        service_fees: serviceFees,
        total_costs: totalCosts,
        net_income: netIncome,
        cash_flow: cashFlow,
        present_value: presentValue
      });
    }
    
    return projections;
  };

  const shouldRecalculate = (data: ValuationBudgetUpdateData): boolean => {
    const financialFields = [
      'initial_sales', 'sales_growth_rate', 'inflation_rate', 'discount_rate',
      'years_projection', 'pac_percentage', 'rent_percentage', 'service_fees_percentage',
      'depreciation', 'interest', 'loan_payment', 'rent_index', 'miscellaneous'
    ];
    
    return financialFields.some(field => data.hasOwnProperty(field));
  };

  useEffect(() => {
    console.log('useValuationBudgets useEffect triggered, user:', user);
    fetchBudgets();
  }, [user?.id]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    calculateProjections
  };
};
