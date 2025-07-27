import React from 'react';
import { useFranchisees } from '@/hooks/data/useFranchisees';
import { useIntegrationConfig } from '@/hooks/useIntegrationConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const FranchiseeIntegrationsTable = () => {
  const { franchisees, loading } = useFranchisees();
  const navigate = useNavigate();

  const handleViewDetails = (franchiseeId: string) => {
    navigate(`/franchisee/${franchiseeId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones de Integración por Franquiciado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuraciones de Integración por Franquiciado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Franquiciado</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Restaurantes</TableHead>
              <TableHead>Orquest API</TableHead>
              <TableHead>Biloop</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {franchisees?.map((franchisee) => (
              <FranchiseeRow 
                key={franchisee.id} 
                franchisee={franchisee}
                onViewDetails={handleViewDetails}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

interface FranchiseeRowProps {
  franchisee: any;
  onViewDetails: (id: string) => void;
}

const FranchiseeRow: React.FC<FranchiseeRowProps> = ({ franchisee, onViewDetails }) => {
  const { configs, getConfigStatus, fetchConfigs } = useIntegrationConfig();
  
  React.useEffect(() => {
    fetchConfigs(franchisee.id);
  }, [franchisee.id, fetchConfigs]);

  const orquestConfig = configs?.orquest || {};
  const biloopConfig = configs?.biloop || {};
  
  const orquestStatus = getConfigStatus(orquestConfig);
  const biloopStatus = getConfigStatus(biloopConfig);

  const getStatusBadge = (statusObj: any) => {
    const status = statusObj?.status || 'none';
    
    switch (status) {
      case 'complete':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Configurado
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Settings className="h-3 w-3 mr-1" />
            Parcial
          </Badge>
        );
      case 'none':
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Sin configurar
          </Badge>
        );
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold">{franchisee.franchisee_name}</div>
          <div className="text-sm text-muted-foreground">{franchisee.company_name}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {franchisee.profiles?.email || 'Sin email'}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {franchisee.total_restaurants || 0} restaurantes
        </Badge>
      </TableCell>
      <TableCell>
        {getStatusBadge(orquestStatus)}
      </TableCell>
      <TableCell>
        {getStatusBadge(biloopStatus)}
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(franchisee.id)}
          className="flex items-center gap-1"
        >
          <Settings className="h-3 w-3" />
          Configurar
        </Button>
      </TableCell>
    </TableRow>
  );
};