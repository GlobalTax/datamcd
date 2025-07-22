import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserX, Users, Eye } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { Franchisee } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ImpersonationControls: React.FC = () => {
  const { 
    user, 
    isImpersonating, 
    impersonatedFranchisee,
    startImpersonation,
    stopImpersonation 
  } = useUnifiedAuth();
  
  const [availableFranchisees, setAvailableFranchisees] = useState<Franchisee[]>([]);
  const [selectedFranchiseeId, setSelectedFranchiseeId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Solo mostrar para asesores y admins
  if (!user || !['asesor', 'admin', 'superadmin'].includes(user.role)) {
    return null;
  }

  const loadFranchisees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .order('franchisee_name');

      if (error) throw error;

      setAvailableFranchisees(data || []);
      console.log('IMPERSONATION: Loaded franchisees:', data?.length);
    } catch (error) {
      console.error('IMPERSONATION: Error loading franchisees:', error);
      toast.error('Error al cargar franquiciados');
    } finally {
      setLoading(false);
    }
  };

  const handleStartImpersonation = () => {
    const selectedFranchisee = availableFranchisees.find(f => f.id === selectedFranchiseeId);
    if (selectedFranchisee) {
      startImpersonation(selectedFranchisee.id);
      setSelectedFranchiseeId('');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4" />
          Controles de Impersonación
          {isImpersonating && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Activa
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isImpersonating ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                Impersonando: {impersonatedFranchisee?.franchisee_name}
              </span>
            </div>
            <Button 
              onClick={stopImpersonation}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <UserX className="w-3 h-3 mr-2" />
              Terminar Impersonación
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={selectedFranchiseeId} onValueChange={setSelectedFranchiseeId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar franquiciado..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFranchisees.map((franchisee) => (
                    <SelectItem key={franchisee.id} value={franchisee.id}>
                      {franchisee.franchisee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={loadFranchisees}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Users className="w-3 h-3" />
              </Button>
            </div>
            <Button 
              onClick={handleStartImpersonation}
              disabled={!selectedFranchiseeId || loading}
              size="sm"
              className="w-full"
            >
              <UserCheck className="w-3 h-3 mr-2" />
              Iniciar Impersonación
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};