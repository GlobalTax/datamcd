
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string | undefined;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  onNavigateToSettings,
  onSignOut
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-500 rounded-md flex items-center justify-center">
              <span className="text-white font-medium text-sm">M</span>
            </div>
            <h1 className="text-xl font-medium text-gray-900">McDonald's</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{userName}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToSettings}
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
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
