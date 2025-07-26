
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Franchisee } from '@/types/core';
import { Plus, Building, Mail, Phone } from 'lucide-react';

interface FranchiseeSelectorProps {
  franchisees: Franchisee[];
  selectedFranchisee: Franchisee | null;
  onSelectFranchisee: (franchisee: Franchisee) => void;
  onAddFranchisee: (franchisee: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function FranchiseeSelector({ 
  franchisees, 
  selectedFranchisee, 
  onSelectFranchisee, 
  onAddFranchisee 
}: FranchiseeSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFranchisee, setNewFranchisee] = useState({
    franchisee_name: '',
    user_id: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFranchisee.franchisee_name && newFranchisee.email) {
      onAddFranchisee({
        franchisee_name: newFranchisee.franchisee_name,
        user_id: newFranchisee.user_id || 'temp-user-id',
        email: newFranchisee.email,
      });
      setNewFranchisee({ franchisee_name: '', user_id: '', email: '', phone: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Franquiciados</h2>
          <p className="text-gray-600">Gestiona los franquiciados de McDonald's</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Franquiciado
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Franquiciado</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">Nombre *</Label>
                <Input
                  id="name"
                  value={newFranchisee.franchisee_name}
                  onChange={(e) => setNewFranchisee(prev => ({ ...prev, franchisee_name: e.target.value }))}
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newFranchisee.email}
                  onChange={(e) => setNewFranchisee(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">Teléfono</Label>
              <Input
                id="phone"
                value={newFranchisee.phone}
                onChange={(e) => setNewFranchisee(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {franchisees.map((franchisee) => (
          <div
            key={franchisee.id} 
            className={`bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:border-red-200 ${
              selectedFranchisee?.id === franchisee.id ? 'ring-2 ring-red-500 border-red-500' : ''
            }`}
            onClick={() => onSelectFranchisee(franchisee)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{franchisee.franchisee_name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{franchisee.profiles?.email || franchisee.email || 'Sin email'}</span>
                  </div>
                  {franchisee.profiles?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{franchisee.profiles.phone}</span>
                    </div>
                  )}
                  <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full inline-block">
                    {franchisee.total_restaurants || 0} restaurantes
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {franchisees.length === 0 && !showAddForm && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay franquiciados</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primer franquiciado</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Franquiciado
          </Button>
        </div>
      )}
    </div>
  );
}
