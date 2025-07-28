import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Users, 
  Search, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Franchisee {
  id: string;
  franchisee_name: string;
  total_restaurants: number;
  company_name?: string;
  city?: string;
  created_at: string;
}

interface FranchiseeSelectorProps {
  franchisees: Franchisee[];
  selectedFranchiseeId: string;
  onFranchiseeChange: (franchiseeId: string) => void;
  loading?: boolean;
  showOnlyWithSites?: boolean;
  getOrquestSitesCount?: (franchiseeId: string) => number;
  getLastSyncTime?: (franchiseeId: string) => string | null;
  isConfigured?: (franchiseeId: string) => boolean;
}

export const FranchiseeSelector: React.FC<FranchiseeSelectorProps> = ({
  franchisees,
  selectedFranchiseeId,
  onFranchiseeChange,
  loading = false,
  showOnlyWithSites = false,
  getOrquestSitesCount,
  getLastSyncTime,
  isConfigured
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'sites' | 'recent'>('name');

  const filteredAndSortedFranchisees = useMemo(() => {
    let filtered = franchisees.filter(franchisee => {
      const matchesSearch = franchisee.franchisee_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        franchisee.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchisee.city?.toLowerCase().includes(searchTerm.toLowerCase());

      if (showOnlyWithSites && getOrquestSitesCount) {
        const sitesCount = getOrquestSitesCount(franchisee.id);
        return matchesSearch && sitesCount > 0;
      }

      return matchesSearch;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'sites':
          if (getOrquestSitesCount) {
            return getOrquestSitesCount(b.id) - getOrquestSitesCount(a.id);
          }
          return b.total_restaurants - a.total_restaurants;
        case 'recent':
          if (getLastSyncTime) {
            const aTime = getLastSyncTime(a.id);
            const bTime = getLastSyncTime(b.id);
            if (!aTime && !bTime) return 0;
            if (!aTime) return 1;
            if (!bTime) return -1;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return a.franchisee_name.localeCompare(b.franchisee_name);
      }
    });

    return filtered;
  }, [franchisees, searchTerm, sortBy, showOnlyWithSites, getOrquestSitesCount, getLastSyncTime]);

  const selectedFranchisee = franchisees.find(f => f.id === selectedFranchiseeId);

  const getFranchiseeStatusInfo = (franchisee: Franchisee) => {
    const sitesCount = getOrquestSitesCount ? getOrquestSitesCount(franchisee.id) : 0;
    const lastSync = getLastSyncTime ? getLastSyncTime(franchisee.id) : null;
    const configured = isConfigured ? isConfigured(franchisee.id) : false;

    return {
      sitesCount,
      lastSync,
      configured,
      hasActivity: sitesCount > 0 || configured
    };
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Selector de Franquiciado
        </CardTitle>
        <CardDescription>
          Selecciona el franquiciado para gestionar su integración con Orquest
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Búsqueda y filtros */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, empresa o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: 'name' | 'sites' | 'recent') => setSortBy(value)}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Por Nombre</SelectItem>
              <SelectItem value="sites">Por Sites</SelectItem>
              <SelectItem value="recent">Por Actividad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selector principal */}
        <div className="space-y-3">
          <Select value={selectedFranchiseeId} onValueChange={onFranchiseeChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccionar franquiciado..." />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {filteredAndSortedFranchisees.map((franchisee) => {
                const status = getFranchiseeStatusInfo(franchisee);
                return (
                  <SelectItem key={franchisee.id} value={franchisee.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{franchisee.franchisee_name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {franchisee.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {franchisee.city}
                            </span>
                          )}
                          <span>{status.sitesCount} sites Orquest</span>
                          <span>{franchisee.total_restaurants} restaurantes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {status.configured ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Información del franquiciado seleccionado */}
          {selectedFranchisee && (
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedFranchisee.franchisee_name}</h3>
                  {selectedFranchisee.company_name && (
                    <p className="text-sm text-muted-foreground">{selectedFranchisee.company_name}</p>
                  )}
                </div>
                <Badge variant={getFranchiseeStatusInfo(selectedFranchisee).configured ? 'default' : 'secondary'}>
                  {getFranchiseeStatusInfo(selectedFranchisee).configured ? 'Configurado' : 'Sin configurar'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-muted-foreground">Sites Orquest</p>
                    <p className="font-medium">{getFranchiseeStatusInfo(selectedFranchisee).sitesCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-muted-foreground">Restaurantes</p>
                    <p className="font-medium">{selectedFranchisee.total_restaurants}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-muted-foreground">Última Sync</p>
                    <p className="font-medium">{formatLastSync(getFranchiseeStatusInfo(selectedFranchisee).lastSync)}</p>
                  </div>
                </div>

                {selectedFranchisee.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-muted-foreground">Ubicación</p>
                      <p className="font-medium">{selectedFranchisee.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mensaje si no hay franquiciado seleccionado */}
        {!selectedFranchiseeId && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Selección requerida:</strong> Selecciona un franquiciado para ver y gestionar su configuración de Orquest.
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas generales */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-blue-600">{filteredAndSortedFranchisees.length}</p>
              <p className="text-muted-foreground">Franquiciados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredAndSortedFranchisees.filter(f => isConfigured ? isConfigured(f.id) : false).length}
              </p>
              <p className="text-muted-foreground">Configurados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {filteredAndSortedFranchisees.reduce((sum, f) => 
                  sum + (getOrquestSitesCount ? getOrquestSitesCount(f.id) : 0), 0
                )}
              </p>
              <p className="text-muted-foreground">Sites Orquest</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};