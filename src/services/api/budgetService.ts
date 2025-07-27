import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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

}