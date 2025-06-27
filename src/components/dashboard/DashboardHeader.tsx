
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/AuthProvider';
import { User as UserType, Franchisee } from '@/types/auth';

interface DashboardHeaderProps {
  user: UserType;
  franchisee?: Franchisee | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  franchisee
}) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSettings = () => {
    window.location.href = '/settings';
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-500 rounded-md flex items-center justify-center">
              <span className="text-white font-medium text-sm">M</span>
            </div>
            <div>
              <h1 className="text-xl font-medium text-gray-900">McDonald's</h1>
              {franchisee && (
                <p className="text-sm text-gray-600">{franchisee.franchisee_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user.full_name || user.email}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettings}
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
