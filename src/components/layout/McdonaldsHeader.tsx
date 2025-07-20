
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { Building2, User, LogOut } from 'lucide-react';

export const McdonaldsHeader: React.FC = () => {
  const { user, effectiveFranchisee, isImpersonating, restaurants } = useUnifiedAuth();

  const handleSignOut = async () => {
    // This would typically call a sign out function
    window.location.href = '/auth';
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* McDonald's Logo and Branding */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mc-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">McDonald's</h1>
                <p className="text-xs text-muted-foreground">Portal de Franquiciados</p>
              </div>
            </div>
            
            {/* Impersonation Banner */}
            {isImpersonating && effectiveFranchisee && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Vista como: {effectiveFranchisee.franchisee_name}
              </Badge>
            )}
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* Restaurant Count */}
            {restaurants && restaurants.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{restaurants.length}</span>
                <span className="text-xs text-muted-foreground">
                  {restaurants.length === 1 ? 'restaurante' : 'restaurantes'}
                </span>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || 'franchisee'}
                </p>
              </div>
              <div className="w-8 h-8 bg-mc-yellow rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-mc-red" />
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
