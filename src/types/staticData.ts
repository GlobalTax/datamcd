
export interface RestaurantData {
  id: string;
  base_restaurant: {
    id: string;
    restaurant_name: string;
    site_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    restaurant_type: 'traditional' | 'drive_thru' | 'express' | 'mccafe';
    opening_date: string;
    square_meters: number;
    seating_capacity: number;
  };
  status: 'active' | 'inactive' | 'pending' | 'closed';
  last_year_revenue: number;
  monthly_rent: number;
  franchise_start_date: string;
  franchise_end_date: string;
}
