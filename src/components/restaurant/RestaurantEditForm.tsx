
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Euro } from 'lucide-react';

interface EditData {
  monthly_rent: number;
  last_year_revenue: number;
  franchise_fee_percentage: number;
  advertising_fee_percentage: number;
  notes: string;
}

interface RestaurantEditFormProps {
  editData: EditData;
  setEditData: React.Dispatch<React.SetStateAction<EditData>>;
  restaurant: any;
  formatNumber: (value: number | undefined | null) => string;
}

const RestaurantEditForm = ({ editData, setEditData, restaurant, formatNumber }: RestaurantEditFormProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Información fija */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Información General</h4>
        
        <div>
          <Label className="text-sm text-gray-600">Dirección</Label>
          <p className="text-sm font-medium">
            {restaurant.base_restaurant?.address}
          </p>
        </div>
        
        <div>
          <Label className="text-sm text-gray-600">Tipo de Restaurante</Label>
          <p className="text-sm font-medium capitalize">
            {restaurant.base_restaurant?.restaurant_type || 'Traditional'}
          </p>
        </div>

        {restaurant.franchise_start_date && (
          <div>
            <Label className="text-sm text-gray-600">Inicio de Franquicia</Label>
            <p className="text-sm font-medium">
              {new Date(restaurant.franchise_start_date).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}
      </div>

      {/* Datos financieros editables */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Datos Financieros</h4>
        
        <div>
          <Label className="text-sm text-gray-600">Renta Mensual (€)</Label>
          <Input
            type="number"
            value={editData.monthly_rent}
            onChange={(e) => setEditData(prev => ({ 
              ...prev, 
              monthly_rent: Number(e.target.value) 
            }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">Facturación Último Año (€)</Label>
          <Input
            type="number"
            value={editData.last_year_revenue}
            onChange={(e) => setEditData(prev => ({ 
              ...prev, 
              last_year_revenue: Number(e.target.value) 
            }))}
            className="mt-1"
          />
        </div>
      </div>

      {/* Tarifas y notas */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Tarifas y Notas</h4>
        
        <div>
          <Label className="text-sm text-gray-600">Tarifa de Franquicia (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={editData.franchise_fee_percentage}
            onChange={(e) => setEditData(prev => ({ 
              ...prev, 
              franchise_fee_percentage: Number(e.target.value) 
            }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">Tarifa de Publicidad (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={editData.advertising_fee_percentage}
            onChange={(e) => setEditData(prev => ({ 
              ...prev, 
              advertising_fee_percentage: Number(e.target.value) 
            }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">Notas</Label>
          <Textarea
            value={editData.notes}
            onChange={(e) => setEditData(prev => ({ 
              ...prev, 
              notes: e.target.value 
            }))}
            className="mt-1"
            rows={3}
            placeholder="Añadir notas sobre el restaurante..."
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantEditForm;
