import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyData {
  name: string;
  nif: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  business_sector?: string;
  legal_representative?: string;
  status: 'activo' | 'inactivo';
  client_type: 'empresa';
  is_mock?: boolean;
}

export const useCompanyLookup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const lookupCompany = async (nif: string): Promise<CompanyData | null> => {
    if (!nif) {
      toast.error('Por favor, introduce un NIF/CIF válido');
      return null;
    }

    setIsLoading(true);
    
    try {
      // First validate the NIF/CIF format
      const { data: validationData, error: validationError } = await supabase.functions.invoke('einforma-integration', {
        body: {
          action: 'validate_cif',
          cif: nif.trim().toUpperCase()
        }
      });

      if (validationError) {
        console.error('Error validating NIF/CIF:', validationError);
        toast.error('Error al validar el formato del NIF/CIF');
        return null;
      }

      if (!validationData.valid) {
        toast.error(`Formato inválido: ${validationData.message}`);
        return null;
      }

      // If valid, enrich company data
      const { data: enrichData, error: enrichError } = await supabase.functions.invoke('einforma-integration', {
        body: {
          action: 'enrich_company',
          cif: nif.trim().toUpperCase()
        }
      });

      if (enrichError) {
        console.error('Error enriching company data:', enrichError);
        toast.error('Error al buscar la empresa');
        return null;
      }

      if (enrichData.success) {
        const company = enrichData.data;
        
        // Show different messages for real vs mock data
        if (enrichData.is_mock) {
          toast.success('Empresa encontrada (datos simulados)', {
            description: `${company.name} - ${company.nif}`
          });
        } else {
          toast.success('Empresa encontrada en eInforma', {
            description: `${company.name} - ${company.nif}`
          });
        }
        
        return company;
      } else {
        // Handle specific error codes
        if (enrichData.code === 'CREDENTIALS_NOT_CONFIGURED') {
          toast.error('Servicio no disponible', {
            description: 'Las credenciales de eInforma no están configuradas'
          });
        } else {
          toast.error(enrichData.error || 'No se encontró la empresa');
        }
        return null;
      }

    } catch (error) {
      console.error('Error in company lookup:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servicio de búsqueda'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lookupCompany,
    isLoading
  };
};