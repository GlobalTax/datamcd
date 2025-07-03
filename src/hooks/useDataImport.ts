
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RestaurantData {
  site: string;
  nombre: string;
  estado: string;
  tipoInmueble: string;
  direccion: string;
  telRestaurante: string;
  municipio: string;
  provincia: string;
  comAutonoma: string;
  franquiciado: string;
  telfFranquiciado: string;
  fechaApertura: string;
  mailFranquiciado: string;
  nifSociedad: string;
}

export const useDataImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const importRestaurantsData = async (data: RestaurantData[]) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const total = data.length;
      let processed = 0;

      for (const restaurant of data) {
        await createBaseRestaurant(restaurant);
        processed++;
        setProgress((processed / total) * 100);
      }

      toast.success(`Se importaron ${total} restaurantes correctamente`);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Error al importar los datos');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const createBaseRestaurant = async (restaurant: RestaurantData) => {
    if (!user?.id) return;

    try {
      // Verificar si el restaurante ya existe
      const { data: existingRestaurant } = await supabase
        .from('base_restaurants')
        .select('id')
        .eq('site_number', restaurant.site)
        .maybeSingle();

      if (existingRestaurant) {
        console.log(`Restaurant ${restaurant.site} already exists, skipping...`);
        return;
      }

      // Mapear tipo de restaurante
      const restaurantTypeMap: { [key: string]: string } = {
        'Instore': 'traditional',
        'Mall': 'mall',
        'Free-Standing': 'drive_thru'
      };

      // Formatear fecha de apertura
      let openingDate = null;
      if (restaurant.fechaApertura && restaurant.fechaApertura.trim()) {
        // Asumiendo formato DD/MM/YYYY o similar
        const dateStr = restaurant.fechaApertura.trim();
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          openingDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (dateStr.includes('-')) {
          openingDate = dateStr; // Ya está en formato correcto
        }
      }

      // Crear restaurante base con todos los campos nuevos
      const { error: restaurantError } = await supabase
        .from('base_restaurants')
        .insert({
          site_number: restaurant.site,
          restaurant_name: restaurant.nombre,
          address: restaurant.direccion,
          city: restaurant.municipio,
          state: restaurant.provincia,
          country: 'España',
          restaurant_type: restaurantTypeMap[restaurant.tipoInmueble] || 'traditional',
          property_type: restaurant.tipoInmueble,
          autonomous_community: restaurant.comAutonoma,
          franchisee_name: restaurant.franquiciado,
          franchisee_email: restaurant.mailFranquiciado,
          company_tax_id: restaurant.nifSociedad,
          opening_date: openingDate,
          created_by: user.id
        });

      if (restaurantError) {
        console.error('Error creating base restaurant:', restaurantError);
        throw restaurantError;
      }

      console.log(`Successfully created restaurant: ${restaurant.nombre} (${restaurant.site})`);
    } catch (error) {
      console.error('Error creating base restaurant:', error);
      throw error;
    }
  };

  return {
    importing,
    progress,
    importRestaurantsData
  };
};
