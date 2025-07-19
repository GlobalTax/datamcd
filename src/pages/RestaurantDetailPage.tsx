
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Euro, Building2, Hash, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RestaurantDetailPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { effectiveFranchisee } = useAuth();
  const { restaurants, loading } = useFranchiseeRestaurants(effectiveFranchisee?.id);

  const restaurant = restaurants.find(r => r.id === restaurantId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando restaurante...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurante no encontrado</h1>
          <p className="text-gray-600 mb-6">El restaurante solicitado no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/restaurant')} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a restaurantes
          </Button>
        </div>
      </div>
    );
  }

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString('es-ES');
  };

  const baseRestaurant = restaurant.base_restaurant;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/restaurant')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a restaurantes
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {baseRestaurant?.restaurant_name || 'Restaurante'}
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Site #{baseRestaurant?.site_number} - {effectiveFranchisee?.franchisee_name}
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
            <span className="text-gray-700 font-medium">Restaurantes</span>
            <span className="mx-3 text-gray-300">/</span>
            <span className="text-red-600 font-medium">{baseRestaurant?.restaurant_name}</span>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-semibold text-gray-900">
                    {baseRestaurant?.address}, {baseRestaurant?.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Restaurante</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {baseRestaurant?.restaurant_type || 'Traditional'}
                  </p>
                </div>
              </div>

              {baseRestaurant?.opening_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Apertura</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(baseRestaurant.opening_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-green-600" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant.last_year_revenue && (
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Facturación Último Año</p>
                    <p className="font-semibold text-gray-900">€{formatNumber(restaurant.last_year_revenue)}</p>
                  </div>
                </div>
              )}

              {restaurant.monthly_rent && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Renta Mensual</p>
                    <p className="font-semibold text-gray-900">€{formatNumber(restaurant.monthly_rent)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Tarifa de Franquicia</p>
                  <p className="font-semibold text-gray-900">{restaurant.franchise_fee_percentage || 4.0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Información Contractual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant.franchise_start_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Inicio de Franquicia</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(restaurant.franchise_start_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {restaurant.franchise_end_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Fin de Franquicia</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(restaurant.franchise_end_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {restaurant.status === 'active' ? 'Activo' : restaurant.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {restaurant.notes && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{restaurant.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
