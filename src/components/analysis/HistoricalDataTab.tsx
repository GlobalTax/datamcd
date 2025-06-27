
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileSpreadsheet, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/AuthProvider';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useNavigate } from 'react-router-dom';

export const HistoricalDataTab: React.FC = () => {
  const { franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  const navigate = useNavigate();

  const handleNavigateToRestaurant = (siteNumber: string) => {
    console.log('Navigating to restaurant:', siteNumber);
    navigate(`/profit-loss/${siteNumber}`);
  };

  const downloadTemplate = () => {
    const headers = [
      'Año', 'Restaurante_ID', 'Ventas_Netas', 'Otros_Ingresos', 'Costo_Comida', 
      'Papel', 'Mano_Obra', 'Gerencia', 'Publicidad', 'Renta', 'Servicios_Publicos',
      'Mantenimiento', 'Seguros', 'Otros_Gastos', 'Fee_Franquicia', 'Fee_Publicidad'
    ];

    const csvContent = headers.join('\t') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_datos_historicos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos Históricos</h2>
        <p className="text-gray-600">
          Gestiona y carga datos históricos de P&L para análisis comparativos
        </p>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para carga
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Franquiciado</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {franchisee?.franchisee_name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Propietario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantilla</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadTemplate}
              className="w-full"
            >
              Descargar CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas de carga */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Carga Masiva por Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Carga datos históricos para un restaurante específico utilizando archivos CSV o Excel.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-medium">Seleccionar Restaurante:</h4>
              {restaurants.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {restaurants.map((restaurant) => (
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
                        <Database className="w-4 h-4 mr-2" />
                        Gestionar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay restaurantes disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Instrucciones de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">1. Descargar Plantilla</h4>
                <p className="text-sm text-gray-600">
                  Descarga la plantilla CSV con el formato correcto para los datos.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">2. Completar Datos</h4>
                <p className="text-sm text-gray-600">
                  Llena la plantilla con los datos históricos de P&L de cada año.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">3. Seleccionar Restaurante</h4>
                <p className="text-sm text-gray-600">
                  Elige el restaurante específico y accede a su herramienta de gestión.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">4. Cargar Datos</h4>
                <p className="text-sm text-gray-600">
                  Utiliza la herramienta "Datos Históricos" en la página del restaurante.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Los datos se dividen automáticamente en registros mensuales para análisis detallado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Formatos Soportados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-medium">Excel (.xlsx)</h4>
                <p className="text-sm text-gray-600">Copia y pega desde Excel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium">CSV (.csv)</h4>
                <p className="text-sm text-gray-600">Separado por tabulaciones</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Texto Plano</h4>
                <p className="text-sm text-gray-600">Copiar y pegar directo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
