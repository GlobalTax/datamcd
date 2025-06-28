
import { Franchisee } from '@/types/auth';
import { RestaurantData } from '@/types/staticData';

export const STATIC_FRANCHISEE_DATA: Franchisee = {
  id: 'static-franchisee-001',
  franchisee_name: 'Franquiciado Principal',
  company_name: 'Empresa McDonald\'s',
  total_restaurants: 3,
  user_id: 'static-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const STATIC_RESTAURANTS_DATA: RestaurantData[] = [
  {
    id: 'rest-001',
    base_restaurant: {
      id: 'base-001',
      restaurant_name: 'McDonald\'s Centro',
      site_number: '001',
      address: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      country: 'España',
      restaurant_type: 'traditional' as const,
      opening_date: '2020-01-15',
      square_meters: 250,
      seating_capacity: 80
    },
    status: 'active' as const,
    last_year_revenue: 850000,
    monthly_rent: 12000,
    franchise_start_date: '2020-01-15',
    franchise_end_date: '2030-01-15'
  },
  {
    id: 'rest-002',
    base_restaurant: {
      id: 'base-002',
      restaurant_name: 'McDonald\'s Norte',
      site_number: '002',
      address: 'Avenida Norte 456',
      city: 'Madrid',
      state: 'Madrid',
      country: 'España',
      restaurant_type: 'drive_thru' as const,
      opening_date: '2021-03-10',
      square_meters: 180,
      seating_capacity: 60
    },
    status: 'active' as const,
    last_year_revenue: 720000,
    monthly_rent: 10000,
    franchise_start_date: '2021-03-10',
    franchise_end_date: '2031-03-10'
  },
  {
    id: 'rest-003',
    base_restaurant: {
      id: 'base-003',
      restaurant_name: 'McDonald\'s Express',
      site_number: '003',
      address: 'Plaza Central 789',
      city: 'Madrid',
      state: 'Madrid',
      country: 'España',
      restaurant_type: 'express' as const,
      opening_date: '2022-06-20',
      square_meters: 120,
      seating_capacity: 40
    },
    status: 'active' as const,
    last_year_revenue: 480000,
    monthly_rent: 8000,
    franchise_start_date: '2022-06-20',
    franchise_end_date: '2032-06-20'
  }
];
