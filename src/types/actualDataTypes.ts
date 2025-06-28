
export interface ActualData {
  id: string;
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
  total: number;
}

export interface ActualDataUpdateParams {
  restaurant_id: string;
  year: number;
  category: string;
  subcategory: string;
  [key: string]: any;
}
