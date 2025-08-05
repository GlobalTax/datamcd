import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyData {
  id?: string;
  cif: string;
  razon_social?: string;
  nombre_comercial?: string;
  domicilio_fiscal?: string;
  codigo_postal?: string;
  municipio?: string;
  provincia?: string;
  codigo_cnae?: string;
  descripcion_cnae?: string;
  situacion_aeat?: string;
  fecha_constitucion?: string;
  capital_social?: number;
  forma_juridica?: string;
  telefono?: string;
  email?: string;
  web?: string;
  empleados_estimados?: number;
  facturacion_estimada?: number;
  rating_crediticio?: string;
  fecha_ultima_actualizacion?: string;
  datos_adicionales?: any;
  validado_einforma?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CIFValidationResult {
  cif: string;
  valid: boolean;
  message: string;
}

export const useEInformaIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);

  const validateCIF = async (cif: string): Promise<CIFValidationResult | null> => {
    if (!cif) return null;
    
    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('einforma-integration', {
        body: {
          action: 'validate_cif',
          cif: cif.trim().toUpperCase()
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating CIF:', error);
      toast.error('Error al validar el CIF');
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const enrichCompanyData = async (cif: string): Promise<CompanyData | null> => {
    if (!cif) return null;

    setIsEnriching(true);
    try {
      console.log('[useEInformaIntegration] Enriching company data for CIF:', cif);
      const { data, error } = await supabase.functions.invoke('einforma-integration', {
        body: {
          action: 'enrich_company',
          cif: cif.trim().toUpperCase()
        }
      });

      if (error) {
        console.error('[useEInformaIntegration] Edge function error:', error);
        throw error;
      }

      console.log('[useEInformaIntegration] Edge function response:', data);

      if (data.success) {
        toast.success('Datos de empresa enriquecidos correctamente');
        console.log('[useEInformaIntegration] Company data enriched successfully:', data.data);
        return data.data;
      } else {
        console.error('[useEInformaIntegration] Enrichment failed:', data.error);
        toast.error(data.error || 'Error al enriquecer los datos');
        return null;
      }
    } catch (error) {
      console.error('[useEInformaIntegration] Error enriching company data:', error);
      toast.error('Error al conectar con eInforma');
      return null;
    } finally {
      setIsEnriching(false);
    }
  };

  const getCompanyData = async (cif: string): Promise<CompanyData | null> => {
    if (!cif) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('einforma-integration', {
        body: {
          action: 'get_company_data',
          cif: cif.trim().toUpperCase()
        }
      });

      if (error) throw error;
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error getting company data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyByCIF = async (cif: string): Promise<CompanyData | null> => {
    if (!cif) return null;

    console.log('[useEInformaIntegration] Getting company by CIF:', cif);
    try {
      const { data, error } = await supabase
        .from('company_data')
        .select('*')
        .eq('cif', cif.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('[useEInformaIntegration] Supabase error fetching company data:', error);
        return null;
      }

      console.log('[useEInformaIntegration] Company data from database:', data);
      return data;
    } catch (error) {
      console.error('[useEInformaIntegration] Error querying company data:', error);
      return null;
    }
  };

  return {
    // Estados
    isLoading,
    isValidating,
    isEnriching,
    
    // Funciones
    validateCIF,
    enrichCompanyData,
    getCompanyData,
    getCompanyByCIF
  };
};