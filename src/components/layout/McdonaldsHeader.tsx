
import React from 'react';
import { Building2, Users, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

export const McdonaldsHeader: React.FC = () => {
  const { user } = useAuth();
  const { isImpersonating, impersonatedFranchisee } = useImpersonation();
  const { selectedFranchisee } = useFranchiseeContext();

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">McDonald's</h1>
            <p className="text-sm text-muted-foreground">Portal de Gestión</p>
          </div>
        </div>

        {(selectedFranchisee || impersonatedFranchisee) && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {impersonatedFranchisee?.franchisee_name || selectedFranchisee?.franchisee_name}
            </span>
            {isImpersonating && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Vista Asesor
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          <Bell className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {user?.full_name || user?.email}
          </span>
          <Badge variant="outline" className="text-xs">
            {user?.role}
          </Badge>
        </div>
        
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
