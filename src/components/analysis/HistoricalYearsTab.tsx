
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Database, FileSpreadsheet, Upload, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/AuthProvider';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useNavigate } from 'react-router-dom';

export const HistoricalYearsTab: React.FC = () => {
  const { franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  const navigate = useNavigate();

  const handleNavigateToRestaurant = (siteNumber: string) => {
    navigate(`/profit-loss/${siteNumber}`);
  };

  // Simular datos de años disponibles (esto vendría de la base de datos)
  const availableYears = [2021, 2022, 2023, 2024];
  const completedYears = [2022, 2023];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Años Históricos</h2>
        <p className="text-gray-600">
          Gestiona los datos históricos por año para análisis comparativo y tendencias
        </p>
      </div>

      {/* Resumen de años */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Años Disponibles</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableYears.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableYears.join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Años Completos</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedYears.length}</div>
            <p className="text-xs text-muted-foreground">
              Con todos los meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
            <p className="text-xs text-muted-foreground">
              Con datos históricos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              Crecimiento anual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vista por años */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Vista por Años
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableYears.map((year) => {
              const isComplete = completedYears.includes(year);
              return (
                <div 
                  key={year}
                  className={`p-4 border rounded-lg ${isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{year}</h3>
                    <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Restaurantes:</span>
                      <span className="font-medium">{restaurants.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                        {isComplete ? 'Completo' : 'Parcial'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        // Navegar al primer restaurante para gestión
                        const firstRestaurant = restaurants[0];
                        if (firstRestaurant?.base_restaurant?.site_number) {
                          handleNavigateToRestaurant(firstRestaurant.base_restaurant.site_number);
                        }
                      }}
                    >
                      Gestionar {year}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Carga por Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Accede a cada restaurante para cargar datos históricos año por año
            </p>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">
                        {restaurant.base_restaurant?.restaurant_name || `Restaurante ${restaurant.base_restaurant?.site_number}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Site: {restaurant.base_restaurant?.site_number}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleNavigateToRestaurant(restaurant.base_restaurant?.site_number || '')}
                      disabled={!restaurant.base_restaurant?.site_number}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Cargar Años
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No hay restaurantes disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Análisis Temporal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Herramientas para análisis de tendencias y comparaciones anuales
            </p>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Comparar Años
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Tendencias
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Histórico
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Usa "Carga por Año Individual" en cada restaurante para mejores resultados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
