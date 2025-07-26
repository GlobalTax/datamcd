
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Restaurant, Franchisee } from '@/types/core';
import { Plus, Edit, MapPin, Euro, Building2, Hash, Calendar, Shield, TrendingUp, Trash2 } from 'lucide-react';

interface RestaurantDataManagerProps {
  franchisees: Franchisee[];
  onUpdateFranchisees: (franchisees: Franchisee[]) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

export function RestaurantDataManager({ franchisees, onUpdateFranchisees, onSelectRestaurant }: RestaurantDataManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contractEndDate: '',
    siteNumber: '',
    lastYearRevenue: 0,
    baseRent: 0,
    rentIndex: 0,
    franchiseeId: '',
    franchiseEndDate: '',
    leaseEndDate: '',
    isOwnedByMcD: false
  });

  // Get all restaurants from all franchisees
  const allRestaurants: (Restaurant & { franchiseeName: string })[] = [];
  // TODO: Implementar la lógica para obtener restaurantes cuando se integre con el backend

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.franchiseeId || !formData.franchiseEndDate) return;

    const restaurantData: Restaurant = {
      id: editingRestaurant?.id || Date.now().toString(),
      franchisee_id: formData.franchiseeId,
      site_number: formData.siteNumber,
      restaurant_name: formData.name,
      address: formData.location,
      city: '',
      country: 'España',
      restaurant_type: 'traditional',
      status: 'active',
      created_at: editingRestaurant?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Implementar actualización de restaurantes con el servicio
    console.log('Restaurant data to save:', restaurantData);
    onUpdateFranchisees(franchisees);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      contractEndDate: '',
      siteNumber: '',
      lastYearRevenue: 0,
      baseRent: 0,
      rentIndex: 0,
      franchiseeId: '',
      franchiseEndDate: '',
      leaseEndDate: '',
      isOwnedByMcD: false
    });
    setShowAddForm(false);
    setEditingRestaurant(null);
  };

  const handleEdit = (restaurant: Restaurant & { franchiseeName: string }) => {
    setFormData({
      name: restaurant.restaurant_name,
      location: restaurant.address,
      contractEndDate: '',
      siteNumber: restaurant.site_number,
      lastYearRevenue: 0,
      baseRent: 0,
      rentIndex: 0,
      franchiseeId: restaurant.franchisee_id,
      franchiseEndDate: '',
      leaseEndDate: '',
      isOwnedByMcD: false
    });
    setEditingRestaurant(restaurant);
    setShowAddForm(true);
  };

  const handleValuationClick = (restaurant: Restaurant & { franchiseeName: string }) => {
    if (onSelectRestaurant) {
      onSelectRestaurant(restaurant);
    }
  };

  const handleViewRestaurant = (restaurant: Restaurant & { franchiseeName: string }) => {
    // Navigate to the restaurant's dedicated page
    window.open(`/restaurant/${restaurant.site_number}`, '_blank');
  };

  const handleNavigateToDemo = () => {
    window.open('/demo', '_blank');
  };

  const handleDeleteRestaurant = (restaurant: Restaurant & { franchiseeName: string }) => {
    // TODO: Implementar eliminación de restaurantes con el servicio
    console.log('Delete restaurant:', restaurant.id);
    onUpdateFranchisees(franchisees);
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString('es-ES');
  };

  return (
    <div className="p-8 font-manrope">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-manrope">Panel Central de Restaurantes</h2>
          <p className="text-gray-600 font-manrope">{allRestaurants.length} restaurantes registrados en total</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 font-manrope"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Restaurante
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-manrope">
              {editingRestaurant ? 'Editar Restaurante' : 'Agregar Nuevo Restaurante'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 font-manrope">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="franchisee" className="font-manrope">Franquiciado *</Label>
                  <select
                    id="franchisee"
                    value={formData.franchiseeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, franchiseeId: e.target.value }))}
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-manrope"
                    required
                  >
                    <option value="">Seleccionar franquiciado</option>
                    {franchisees.map(f => (
                      <option key={f.id} value={f.id}>{f.franchisee_name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="siteNumber" className="font-manrope">Número de Site *</Label>
                  <Input
                    id="siteNumber"
                    value={formData.siteNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteNumber: e.target.value }))}
                    placeholder="ej. MCB001"
                    className="font-manrope"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="restaurantName" className="font-manrope">Nombre del Restaurante *</Label>
                  <Input
                    id="restaurantName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. McDonald's Parc Central"
                    className="font-manrope"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="font-manrope">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="ej. Barcelona, España"
                    className="font-manrope"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contractEnd" className="font-manrope">Fecha Fin de Contrato *</Label>
                  <Input
                    id="contractEnd"
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractEndDate: e.target.value }))}
                    className="font-manrope"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="franchiseEnd" className="font-manrope">Fecha Fin de Franquicia *</Label>
                  <Input
                    id="franchiseEnd"
                    type="date"
                    value={formData.franchiseEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, franchiseEndDate: e.target.value }))}
                    className="font-manrope"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="isOwnedByMcD" className="flex items-center gap-2 font-manrope">
                    <input
                      type="checkbox"
                      id="isOwnedByMcD"
                      checked={formData.isOwnedByMcD}
                      onChange={(e) => setFormData(prev => ({ ...prev, isOwnedByMcD: e.target.checked }))}
                      className="rounded"
                    />
                    Propiedad de McDonald's
                  </Label>
                </div>

                {!formData.isOwnedByMcD && (
                  <div>
                    <Label htmlFor="leaseEnd" className="font-manrope">Fecha Fin de Alquiler</Label>
                    <Input
                      id="leaseEnd"
                      type="date"
                      value={formData.leaseEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaseEndDate: e.target.value }))}
                      className="font-manrope"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="lastYearRevenue" className="font-manrope">Facturación Último Año (€)</Label>
                  <Input
                    id="lastYearRevenue"
                    type="number"
                    value={formData.lastYearRevenue}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastYearRevenue: Number(e.target.value) }))}
                    placeholder="2454919"
                    className="font-manrope"
                  />
                </div>

                <div>
                  <Label htmlFor="baseRent" className="font-manrope">Renta Base (€)</Label>
                  <Input
                    id="baseRent"
                    type="number"
                    value={formData.baseRent}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseRent: Number(e.target.value) }))}
                    placeholder="281579"
                    className="font-manrope"
                  />
                </div>

                <div>
                  <Label htmlFor="rentIndex" className="font-manrope">Rent Index (€)</Label>
                  <Input
                    id="rentIndex"
                    type="number"
                    value={formData.rentIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, rentIndex: Number(e.target.value) }))}
                    placeholder="75925"
                    className="font-manrope"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-manrope">
                  {editingRestaurant ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="font-manrope">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse font-manrope text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[100px]">
                    Site #
                  </th>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[180px]">
                    Restaurante
                  </th>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[150px]">
                    Franquiciado
                  </th>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[150px]">
                    Ubicación
                  </th>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[120px]">
                    Fin Franquicia
                  </th>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[120px]">
                    Fin Alquiler
                  </th>
                  <th className="border border-gray-300 p-4 text-left bg-gray-800 text-white font-semibold font-manrope min-w-[100px]">
                    Propiedad
                  </th>
                  <th className="border border-gray-300 p-4 text-right bg-gray-800 text-white font-semibold font-manrope min-w-[120px]">
                    Facturación
                  </th>
                  <th className="border border-gray-300 p-4 text-right bg-gray-800 text-white font-semibold font-manrope min-w-[120px]">
                    Renta Base
                  </th>
                  <th className="border border-gray-300 p-4 text-right bg-gray-800 text-white font-semibold font-manrope min-w-[100px]">
                    Rent Index
                  </th>
                  <th className="border border-gray-300 p-4 text-center bg-gray-800 text-white font-semibold font-manrope min-w-[120px]">
                    Valoración
                  </th>
                  <th className="border border-gray-300 p-4 text-center bg-gray-800 text-white font-semibold font-manrope min-w-[120px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {allRestaurants.map((restaurant, index) => (
                  <tr key={restaurant.id} className="hover:bg-blue-50 transition-all duration-200">
                    <td className="border border-gray-300 p-4 bg-white font-manrope">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{restaurant.site_number}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white font-semibold font-manrope">
                      {restaurant.restaurant_name}
                    </td>
                    <td className="border border-gray-300 p-4 bg-white font-manrope">
                      {restaurant.franchiseeName}
                    </td>
                    <td className="border border-gray-300 p-4 bg-white font-manrope">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {restaurant.address}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white font-manrope">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        N/A
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white font-manrope">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        N/A
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white font-manrope">
                      <span className="text-gray-500">N/A</span>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white text-right font-manrope">
                      <div className="flex items-center justify-end gap-1">
                        <Euro className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{formatNumber(0)}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white text-right font-manrope">
                      <div className="flex items-center justify-end gap-1">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{formatNumber(0)}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white text-right font-manrope font-medium">
                      €{formatNumber(0)}
                    </td>
                    <td className="border border-gray-300 p-4 bg-white text-center font-manrope">
                      <span className="text-gray-500 text-sm">Sin valorar</span>
                    </td>
                    <td className="border border-gray-300 p-4 bg-white text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(restaurant)}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-manrope"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNavigateToDemo}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 font-manrope"
                          title="Ir a Valoración"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-900 hover:bg-red-100 font-manrope"
                              title="Eliminar Restaurante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="font-manrope">
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el restaurante "{restaurant.restaurant_name}" y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-manrope">Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteRestaurant(restaurant)}
                                className="bg-red-600 hover:bg-red-700 font-manrope"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allRestaurants.length === 0 && (
            <div className="text-center py-16 font-manrope">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-manrope">No hay restaurantes registrados</h3>
              <p className="text-gray-600 mb-6 font-manrope">Comienza agregando el primer restaurante al sistema</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 font-manrope"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Restaurante
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
