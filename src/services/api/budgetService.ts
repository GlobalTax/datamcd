import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { ValuationBudget, ValuationBudgetFormData, ValuationBudgetUpdateData, ProjectedYear } from '@/types/budget';
import { toast } from 'sonner';

export interface AnnualBudgetData {
  id: string;
  restaurant_id: string;
  year: number;
  category: string;
  subcategory?: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export class BudgetService {
  // Annual Budgets Methods
  static async fetchAnnualBudgets(restaurantId: string, year: number, userId: string): Promise<AnnualBudgetData[]> {
    logger.info('Fetching annual budgets', { restaurantId, year, userId });
    
    if (!userId || !restaurantId) {
      logger.warn('Missing required parameters for annual budgets fetch');
      return [];
    }

    try {
      // First verify restaurant access
      const { data: restaurantCheck, error: restaurantError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          franchisee_id,
          franchisees!inner(
            user_id
          )
        `)
        .eq('id', restaurantId)
        .eq('franchisees.user_id', userId)
        .single();

      if (restaurantError) {
        logger.error('Error checking restaurant access', { error: restaurantError });
        throw new Error('No tienes acceso a este restaurante');
      }

      logger.debug('Restaurant access verified', { restaurantCheck });

      const { data, error } = await supabase
        .from('annual_budgets')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', year)
        .order('category', { ascending: true })
        .order('subcategory', { ascending: true });

      if (error) {
        logger.error('Error fetching annual budgets', { error });
        throw new Error(`Error al cargar los presupuestos: ${error.message}`);
      }

      logger.info('Successfully fetched annual budgets', { count: data?.length || 0 });
      return data || [];
      
    } catch (err) {
      logger.error('Unexpected error in fetchAnnualBudgets', { error: err });
      throw err;
    }
  }

  static async saveAnnualBudgets(
    restaurantId: string, 
    year: number, 
    budgetData: any[], 
    userId: string
  ): Promise<boolean> {
    logger.info('Saving annual budgets', { restaurantId, year, budgetCount: budgetData.length });

    if (!userId) {
      logger.warn('No user ID provided for saving budgets');
      return false;
    }

    try {
      // Convert grid data to database format
      const budgetEntries = budgetData
        .filter(item => !item.isCategory) // Only save items, not categories
        .map(item => ({
          restaurant_id: restaurantId,
          year: year,
          category: item.category,
          subcategory: item.subcategory,
          jan: item.jan || 0,
          feb: item.feb || 0,
          mar: item.mar || 0,
          apr: item.apr || 0,
          may: item.may || 0,
          jun: item.jun || 0,
          jul: item.jul || 0,
          aug: item.aug || 0,
          sep: item.sep || 0,
          oct: item.oct || 0,
          nov: item.nov || 0,
          dec: item.dec || 0,
          created_by: userId
        }));

      logger.debug('Budget entries to save', { budgetEntries });

      // First delete existing records for this restaurant and year
      const { error: deleteError } = await supabase
        .from('annual_budgets')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('year', year);

      if (deleteError) {
        logger.error('Error deleting existing budgets', { error: deleteError });
        throw new Error('Error al actualizar el presupuesto: ' + deleteError.message);
      }

      // Insert new records
      const { error: insertError } = await supabase
        .from('annual_budgets')
        .insert(budgetEntries);

      if (insertError) {
        logger.error('Error inserting budgets', { error: insertError });
        throw new Error('Error al guardar el presupuesto: ' + insertError.message);
      }

      logger.info('Annual budgets saved successfully');
      return true;

    } catch (err) {
      logger.error('Error saving annual budgets', { error: err });
      throw err;
    }
  }

  // Valuation Budgets Methods
  static async fetchValuationBudgets(): Promise<ValuationBudget[]> {
    logger.info('Fetching valuation budgets');

    try {
      const { data: budgetsData, error } = await supabase
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

      if (error) {
        logger.error('Error fetching valuation budgets', { error });
        throw new Error(`Error al cargar los presupuestos: ${error.message}`);
      }

      logger.debug('Raw valuation budgets data', { budgetsData });
      
      // Transform data to handle Json type of projected_cash_flows
      const transformedBudgets = (budgetsData || []).map(budget => ({
        ...budget,
        projected_cash_flows: Array.isArray(budget.projected_cash_flows) 
          ? budget.projected_cash_flows 
          : budget.projected_cash_flows ? JSON.parse(budget.projected_cash_flows as string) : []
      })) as ValuationBudget[];

      logger.info('Successfully fetched valuation budgets', { count: transformedBudgets.length });
      return transformedBudgets;
      
    } catch (err) {
      logger.error('Error in fetchValuationBudgets', { error: err });
      throw err;
    }
  }

  static async createValuationBudget(budgetData: ValuationBudgetFormData, userId: string): Promise<boolean> {
    logger.info('Creating valuation budget', { budgetData });

    try {
      // Calculate projections
      const projectedYears = this.calculateProjections(budgetData);
      const finalValuation = projectedYears.reduce((sum, year) => sum + year.present_value, 0);
      const projectedCashFlows = projectedYears.map(year => year.cash_flow);

      const { error } = await supabase
        .from('valuation_budgets')
        .insert({
          ...budgetData,
          final_valuation: finalValuation,
          projected_cash_flows: projectedCashFlows,
          created_by: userId
        });

      if (error) {
        logger.error('Error creating valuation budget', { error });
        throw new Error('Error al crear el presupuesto: ' + error.message);
      }

      logger.info('Valuation budget created successfully');
      return true;
    } catch (err) {
      logger.error('Error creating valuation budget', { error: err });
      throw err;
    }
  }

  static async updateValuationBudget(
    id: string, 
    budgetData: ValuationBudgetUpdateData, 
    existingBudgets: ValuationBudget[]
  ): Promise<boolean> {
    logger.info('Updating valuation budget', { id, budgetData });

    try {
      // Recalculate projections if financial parameters changed
      let updateData = { ...budgetData };
      
      if (this.shouldRecalculate(budgetData)) {
        const fullBudget = existingBudgets.find(b => b.id === id);
        if (fullBudget) {
          const mergedData = { ...fullBudget, ...budgetData } as ValuationBudgetFormData;
          const projectedYears = this.calculateProjections(mergedData);
          updateData.final_valuation = projectedYears.reduce((sum, year) => sum + year.present_value, 0);
          updateData.projected_cash_flows = projectedYears.map(year => year.cash_flow);
        }
      }

      const { error } = await supabase
        .from('valuation_budgets')
        .update(updateData)
        .eq('id', id);

      if (error) {
        logger.error('Error updating valuation budget', { error });
        throw new Error('Error al actualizar el presupuesto: ' + error.message);
      }

      logger.info('Valuation budget updated successfully');
      return true;
    } catch (err) {
      logger.error('Error updating valuation budget', { error: err });
      throw err;
    }
  }

  static async deleteValuationBudget(id: string): Promise<boolean> {
    logger.info('Deleting valuation budget', { id });

    try {
      const { error } = await supabase
        .from('valuation_budgets')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting valuation budget', { error });
        throw new Error('Error al eliminar el presupuesto: ' + error.message);
      }

      logger.info('Valuation budget deleted successfully');
      return true;
    } catch (err) {
      logger.error('Error deleting valuation budget', { error: err });
      throw err;
    }
  }

  // Utility Methods
  static calculateProjections(data: ValuationBudgetFormData): ProjectedYear[] {
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
  }

  static shouldRecalculate(data: ValuationBudgetUpdateData): boolean {
    const financialFields = [
      'initial_sales', 'sales_growth_rate', 'inflation_rate', 'discount_rate',
      'years_projection', 'pac_percentage', 'rent_percentage', 'service_fees_percentage',
      'depreciation', 'interest', 'loan_payment', 'rent_index', 'miscellaneous'
    ];
    
    return financialFields.some(field => data.hasOwnProperty(field));
  }
}