/**
 * Rate Limiting Dashboard - McDonald's Portal
 * 
 * Componente para visualizar y gestionar el estado del rate limiting
 * Solo accesible para administradores
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Clock, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { toast } from 'sonner';

interface RateLimitStats {
  totalRequests: number;
  blockedIPs: number;
  violations: number;
  topEndpoints: Array<{ endpoint: string; requests: number }>;
}

interface BlockedIP {
  ip: string;
  endpoint: string;
  blocked_until: string;
  reason: string;
  created_at: string;
}

interface Violation {
  ip: string;
  endpoint: string;
  requests_count: number;
  block_duration: number;
  created_at: string;
}

export const RateLimitDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar que el usuario sea admin
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4" />
            <p>Solo administradores pueden acceder a esta funcionalidad</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    loadRateLimitData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadRateLimitData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRateLimitData = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas generales
      const { data: entries, error: entriesError } = await supabase
        .from('rate_limit_entries')
        .select('*')
        .gte('window_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (entriesError) throw entriesError;

      // Obtener IPs bloqueadas
      const { data: blocked, error: blockedError } = await supabase
        .from('rate_limit_blocks')
        .select('*')
        .gte('blocked_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (blockedError) throw blockedError;

      // Obtener violaciones recientes
      const { data: violationData, error: violationsError } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (violationsError) throw violationsError;

      // Procesar estadísticas
      const totalRequests = entries?.reduce((sum, entry) => sum + entry.requests, 0) || 0;
      const endpointCounts: Record<string, number> = {};
      
      entries?.forEach(entry => {
        endpointCounts[entry.endpoint] = (endpointCounts[entry.endpoint] || 0) + entry.requests;
      });

      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, requests]) => ({ endpoint, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10);

      setStats({
        totalRequests,
        blockedIPs: blocked?.length || 0,
        violations: violationData?.length || 0,
        topEndpoints
      });

      setBlockedIPs(blocked || []);
      setViolations(violationData || []);

    } catch (error) {
      console.error('Error loading rate limit data:', error);
      toast.error('Error al cargar datos de rate limiting');
    } finally {
      setLoading(false);
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      const { error } = await supabase
        .from('rate_limit_blocks')
        .delete()
        .eq('ip', ip);

      if (error) throw error;

      toast.success(`IP ${ip} desbloqueada correctamente`);
      loadRateLimitData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('Error al desbloquear IP');
    }
  };

  const cleanupOldRecords = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_rate_limit_records');
      
      if (error) throw error;

      toast.success('Registros antiguos eliminados correctamente');
      loadRateLimitData();
    } catch (error) {
      console.error('Error cleaning up records:', error);
      toast.error('Error al limpiar registros');
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getSeverityColor = (requestsCount: number): string => {
    if (requestsCount > 100) return 'destructive';
    if (requestsCount > 50) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Cargando datos de seguridad...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requests (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.blockedIPs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Violaciones (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.violations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={cleanupOldRecords} size="sm" className="w-full">
              Limpiar Registros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Más Utilizados (24h)</CardTitle>
          <CardDescription>
            Distribución de requests por endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.topEndpoints.map((endpoint, index) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between">
                <span className="text-sm font-mono">{endpoint.endpoint}</span>
                <Badge variant="outline">
                  {endpoint.requests.toLocaleString()} requests
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IPs bloqueadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            IPs Bloqueadas Actualmente
          </CardTitle>
          <CardDescription>
            IPs temporalmente bloqueadas por violaciones de rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blockedIPs.length === 0 ? (
            <p className="text-muted-foreground">No hay IPs bloqueadas actualmente</p>
          ) : (
            <div className="space-y-3">
              {blockedIPs.map((block) => (
                <div key={`${block.ip}-${block.endpoint}`} 
                     className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-mono text-sm font-medium">{block.ip}</div>
                    <div className="text-xs text-muted-foreground">
                      {block.endpoint} • {block.reason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Hasta: {new Date(block.blocked_until).toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => unblockIP(block.ip)}
                  >
                    Desbloquear
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violaciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Violaciones Recientes (24h)
          </CardTitle>
          <CardDescription>
            Historial de violaciones de rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <p className="text-muted-foreground">No se detectaron violaciones</p>
          ) : (
            <div className="space-y-2">
              {violations.slice(0, 20).map((violation, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-l-2 border-warning pl-3">
                  <div>
                    <div className="font-mono text-sm">{violation.ip}</div>
                    <div className="text-xs text-muted-foreground">
                      {violation.endpoint} • {violation.requests_count} requests
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getSeverityColor(violation.requests_count)}>
                      Bloqueo: {formatDuration(violation.block_duration)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(violation.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};