import React, { useState } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Bug, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

export const AuthDebugPanel: React.FC = () => {
  const { getDebugInfo, connectionStatus } = useUnifiedAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const refreshDebugInfo = () => {
    const info = getDebugInfo();
    setDebugInfo(info);
    logger.debug('Auth debug state', { ...info, component: 'AuthDebugPanel' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'reconnecting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi className="w-4 h-4 text-green-600" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'reconnecting': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Auth Debug
                <Badge className={getStatusColor(connectionStatus)}>
                  <ConnectionIcon />
                  <span className="ml-1 text-xs">{connectionStatus}</span>
                </Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Button 
                onClick={refreshDebugInfo} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Refresh Debug Info
              </Button>

              {debugInfo && (
                <div className="space-y-3 text-xs">
                  {/* Estado de Autenticación */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Authentication</h4>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      <div>User: {debugInfo.auth.user?.email || 'None'}</div>
                      <div>Role: {debugInfo.auth.user?.role || 'None'}</div>
                      <div>Session: {debugInfo.auth.session ? 'Active' : 'None'}</div>
                      <div>Loading: {debugInfo.auth.loading ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Estado de Impersonación */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Impersonation</h4>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      <div>Active: {debugInfo.franchisee.isImpersonating ? 'Yes' : 'No'}</div>
                      <div>Original: {debugInfo.franchisee.original?.name || 'None'}</div>
                      <div>Impersonated: {debugInfo.franchisee.impersonated?.name || 'None'}</div>
                      <div>Effective: {debugInfo.franchisee.effective?.name || 'None'}</div>
                    </div>
                  </div>

                  {/* Restaurantes */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Restaurants</h4>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      <div>Count: {debugInfo.restaurants.count}</div>
                      <div>IDs: {debugInfo.restaurants.ids.slice(0, 3).join(', ')}
                        {debugInfo.restaurants.ids.length > 3 && '...'}
                      </div>
                    </div>
                  </div>

                  {/* Información del Sistema */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">System</h4>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      <div>User ID: {debugInfo.system.currentUserId?.slice(0, 8) || 'None'}...</div>
                      <div>Initialized: {debugInfo.system.authInitialized ? 'Yes' : 'No'}</div>
                      <div>Updated: {new Date(debugInfo.system.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};