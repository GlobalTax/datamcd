
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Euro, Building2, Hash, Shield, TrendingUp } from 'lucide-react';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, restaurants, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando restaurante...</p>
        </div>
      </div>
    );
  }

  // Buscar el restaurante por ID - puede ser el ID del franchisee_restaurant o del base_restaurant
  const restaurantData = restaurants?.find(r => {
    return r.id === id || 
           (r.base_restaurant && r.base_restaurant.id === id) ||
           (r.base_restaurant_id === id);
  });

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurante no encontrado</h1>
          <p className="text-gray-600 mb-6">El restaurante solicitado no existe.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Extraer datos del restaurante base y datos financieros
  const restaurant = restaurantData.base_restaurant || {
    restaurant_name: 'Restaurante',
    site_number: 'N/A',
    address: 'Dirección no disponible',
    city: 'Ciudad no disponible',
    restaurant_type: 'traditional'
  };
  
  const financialData = restaurantData;

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString('es-ES');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {restaurant.restaurant_name}
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Site #{restaurant.site_number}
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/valuation')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Valorar Restaurante
            </Button>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 bg-white px-4 py-3 rounded-lg border border-gray-200">
            <span className="text-gray-700 font-medium">Dashboard</span>
            <span className="mx-3 text-gray-300">/</span>
            <span className="text-red-600 font-medium">{restaurant.restaurant_name}</span>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información Básica</h2>
              
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Site Number</p>
                  <p className="font-semibold text-gray-900">{restaurant.site_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-semibold text-gray-900">{restaurant.address}</p>
                  <p className="text-sm text-gray-600">{restaurant.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-semibold text-gray-900 capitalize">{restaurant.restaurant_type}</p>
                </div>
              </div>

              {restaurant.square_meters && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Superficie</p>
                    <p className="font-semibold text-gray-900">{restaurant.square_meters} m²</p>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información Financiera</h2>
              
              {financialData.last_year_revenue && (
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Facturación Último Año</p>
                    <p className="font-semibold text-gray-900">€{formatNumber(financialData.last_year_revenue)}</p>
                  </div>
                </div>
              )}

              {financialData.monthly_rent && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Renta Mensual</p>
                    <p className="font-semibold text-gray-900">€{formatNumber(financialData.monthly_rent)}</p>
                  </div>
                </div>
              )}

              {financialData.average_monthly_sales && (
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Ventas Promedio Mensual</p>
                    <p className="font-semibold text-gray-900">€{formatNumber(financialData.average_monthly_sales)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contract Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información Contractual</h2>
              
              {financialData.franchise_end_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Fin de Franquicia</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(financialData.franchise_end_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {financialData.lease_end_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Fin de Alquiler</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(financialData.lease_end_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className={`font-semibold ${
                    financialData.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {financialData.status === 'active' ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Acciones</h2>
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/valuation')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Realizar Valoración
                </Button>
                <Button 
                  onClick={() => navigate('/analysis')}
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Ver Análisis Financiero
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
