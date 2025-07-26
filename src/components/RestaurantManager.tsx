import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Restaurant, Franchisee } from '@/types/core';
import { Plus, MapPin, Calendar, TrendingUp, Hash, Euro, Building2 } from 'lucide-react';

interface RestaurantManagerProps {
  franchisee: Franchisee;
  onAddRestaurant: (restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedRestaurant: Restaurant | null;
}

// Helper function to safely format numbers
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('es-ES');
};

export function RestaurantManager({ 
  franchisee, 
  onAddRestaurant, 
  onSelectRestaurant,
  selectedRestaurant 
}: RestaurantManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    location: '',
    contractEndDate: '',
    siteNumber: '',
    lastYearRevenue: 0,
    baseRent: 0,
    rentIndex: 0,
    franchiseEndDate: '',
    leaseEndDate: '',
    isOwnedByMcD: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRestaurant.name && newRestaurant.location && newRestaurant.contractEndDate && newRestaurant.siteNumber && newRestaurant.franchiseEndDate) {
      onAddRestaurant({
        franchisee_id: franchisee.id,
        site_number: newRestaurant.siteNumber,
        restaurant_name: newRestaurant.name,
        address: newRestaurant.location,
        city: '',
        country: 'España',
        restaurant_type: 'traditional',
        status: 'active'
      });
      setNewRestaurant({ 
        name: '', 
        location: '', 
        contractEndDate: '', 
        siteNumber: '', 
        lastYearRevenue: 0, 
        baseRent: 0, 
        rentIndex: 0,
        franchiseEndDate: '',
        leaseEndDate: '',
        isOwnedByMcD: false
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurantes de {franchisee.franchisee_name}</h2>
          <p className="text-gray-600">{franchisee.total_restaurants || 0} restaurantes registrados</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Restaurante
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Restaurante</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="siteNumber" className="text-gray-700 font-medium">Número de Site *</Label>
                <Input
                  id="siteNumber"
                  value={newRestaurant.siteNumber}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, siteNumber: e.target.value }))}
                  placeholder="ej. MCB001"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurantName" className="text-gray-700 font-medium">Nombre del Restaurante *</Label>
                <Input
                  id="restaurantName"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej. McDonald's Parc Central"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-gray-700 font-medium">Ubicación *</Label>
                <Input
                  id="location"
                  value={newRestaurant.location}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="ej. Barcelona, España"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contractEnd" className="text-gray-700 font-medium">Fecha Fin de Contrato *</Label>
                <Input
                  id="contractEnd"
                  type="date"
                  value={newRestaurant.contractEndDate}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, contractEndDate: e.target.value }))}
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="franchiseEnd" className="text-gray-700 font-medium">Fecha Fin de Franquicia *</Label>
                <Input
                  id="franchiseEnd"
                  type="date"
                  value={newRestaurant.franchiseEndDate}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, franchiseEndDate: e.target.value }))}
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastYearRevenue" className="text-gray-700 font-medium">Facturación Último Año (€)</Label>
                <Input
                  id="lastYearRevenue"
                  type="number"
                  value={newRestaurant.lastYearRevenue}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, lastYearRevenue: Number(e.target.value) }))}
                  placeholder="2454919"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div>
                <Label htmlFor="baseRent" className="text-gray-700 font-medium">Renta Base (€)</Label>
                <Input
                  id="baseRent"
                  type="number"
                  value={newRestaurant.baseRent}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, baseRent: Number(e.target.value) }))}
                  placeholder="281579"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div>
                <Label htmlFor="rentIndex" className="text-gray-700 font-medium">Rent Index (€)</Label>
                <Input
                  id="rentIndex"
                  type="number"
                  value={newRestaurant.rentIndex}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, rentIndex: Number(e.target.value) }))}
                  placeholder="75925"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOwnedByMcD"
                  checked={newRestaurant.isOwnedByMcD}
                  onCheckedChange={(checked) => setNewRestaurant(prev => ({ 
                    ...prev, 
                    isOwnedByMcD: checked as boolean,
                    leaseEndDate: checked ? '' : prev.leaseEndDate
                  }))}
                />
                <Label htmlFor="isOwnedByMcD" className="text-gray-700 font-medium">
                  Propiedad de McDonald's (sin fecha de alquiler)
                </Label>
              </div>
              
              {!newRestaurant.isOwnedByMcD && (
                <div>
                  <Label htmlFor="leaseEnd" className="text-gray-700 font-medium">Fecha Fin de Alquiler</Label>
                  <Input
                    id="leaseEnd"
                    type="date"
                    value={newRestaurant.leaseEndDate}
                    onChange={(e) => setNewRestaurant(prev => ({ ...prev, leaseEndDate: e.target.value }))}
                    className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Guardar
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* TODO: Implementar listado de restaurantes cuando se integre con el backend */}
        {([] as Restaurant[]).map((restaurant) => (
          <div
            key={restaurant.id}
            className={`bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:border-red-200 ${
              selectedRestaurant?.id === restaurant.id ? 'ring-2 ring-red-500 border-red-500' : ''
            }`}
            onClick={() => onSelectRestaurant(restaurant)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900">{restaurant.restaurant_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span>Site: {restaurant.site_number}</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-lg">M</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{restaurant.address}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Euro className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Facturación</p>
                        <p className="font-medium">€{formatNumber(0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Renta Base</p>
                        <p className="font-medium">€{formatNumber(0)}</p>
                      </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Apertura: <span className="font-medium">{restaurant.opening_date ? new Date(restaurant.opening_date).toLocaleDateString('es-ES') : 'N/A'}</span></span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Estado: {restaurant.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(franchisee.total_restaurants || 0) === 0 && !showAddForm && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay restaurantes</h3>
          <p className="text-gray-600 mb-6">Agrega el primer restaurante para {franchisee.franchisee_name}</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Restaurante
          </Button>
        </div>
      )}
    </div>
  );
}
