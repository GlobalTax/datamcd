
import { supabase } from '@/integrations/supabase/client';
import { Franchisee } from '@/types/auth';
import { toast } from 'sonner';

interface FranchiseeFetcherProps {
  setFranchisee: (franchisee: Franchisee | null) => void;
}

export const useFranchiseeFetcher = ({ setFranchisee }: FranchiseeFetcherProps) => {
  
  const fetchFranchiseeData = async (userId: string, profile: any) => {
    try {
      console.log('fetchFranchiseeData - Starting for user:', userId);
      
      // Aumentar timeout a 10 segundos para aprovechar el nuevo plan
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Franchisee query timeout')), 10000);
      });
      
      const franchiseePromise = supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: franchiseeData, error: franchiseeError } = await Promise.race([
        franchiseePromise,
        timeoutPromise
      ]) as any;

      console.log('fetchFranchiseeData - Franchisee query completed');

      if (franchiseeError && !franchiseeError.message?.includes('timeout')) {
        console.error('fetchFranchiseeData - Franchisee error details:', franchiseeError);
        
        // Si no existe el franquiciado, crear uno básico
        if (franchiseeError.code === 'PGRST116') {
          console.log('fetchFranchiseeData - No franchisee found, creating basic one');
          
          const basicFranchisee = {
            id: 'temp-' + userId,
            user_id: userId,
            franchisee_name: profile.full_name || profile.email || 'Usuario',
            company_name: 'Empresa',
            total_restaurants: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Franchisee;

          setFranchisee(basicFranchisee);
          return basicFranchisee;
        }
        return null;
      }

      if (franchiseeData) {
        console.log('fetchFranchiseeData - Setting franchisee:', franchiseeData);
        setFranchisee(franchiseeData as Franchisee);
        return franchiseeData;
      }

      // Si no hay franquiciado, crear uno básico
      console.log('fetchFranchiseeData - No franchisee data, creating basic one');
      const basicFranchisee = {
        id: 'temp-' + userId,
        user_id: userId,
        franchisee_name: profile.full_name || profile.email || 'Usuario',
        company_name: 'Empresa',
        total_restaurants: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Franchisee;

      setFranchisee(basicFranchisee);
      return basicFranchisee;
      
    } catch (error) {
      console.error('fetchFranchiseeData - Timeout or error:', error);
      
      // Crear franquiciado básico en caso de timeout
      const basicFranchisee = {
        id: 'temp-' + userId,
        user_id: userId,
        franchisee_name: profile.full_name || profile.email || 'Usuario',
        company_name: 'Empresa',
        total_restaurants: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Franchisee;

      console.log('fetchFranchiseeData - Setting basic franchisee due to timeout');
      setFranchisee(basicFranchisee);
      return basicFranchisee;
    }
  };

  return { fetchFranchiseeData };
};
