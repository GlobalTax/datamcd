
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/AuthProvider';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Database, User, Building, AlertCircle, CheckCircle } from 'lucide-react';

export const RealDataStatus = () => {
  const navigate = useNavigate();
  const { user, franchisee, restaurants, loading, error } = useAuth();

  if (!user) return null;

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Database className="w-5 h-5" />
          Estado de Datos Reales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Usuario */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-sm">Usuario</div>
              <div className="text-xs text-gray-600">{user.email}</div>
              <Badge variant="outline" className="text-xs">{user.role}</Badge>
            </div>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>

          {/* Franquiciado */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Franquiciado</div>
              <div className="text-xs text-gray-600">
                {franchisee ? franchisee.franchisee_name : 'No asignado'}
              </div>
            </div>
            {franchisee ? (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500 ml-auto" />
            )}
          </div>

          {/* Restaurantes */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <Building className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-sm">Restaurantes</div>
              <div className="text-xs text-gray-600">
                {restaurants.length} restaurantes
              </div>
            </div>
            {restaurants.length > 0 ? (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500 ml-auto" />
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Ir al Dashboard
          </Button>
          
          {user.role === 'asesor' && (
            <Button 
              onClick={() => navigate('/advisor')}
              size="sm"
              variant="outline"
            >
              Panel de Asesor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
