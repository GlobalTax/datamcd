import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitEntry {
  id: string;
  ip_address: string;
  endpoint: string;
  request_count: number;
  window_start: string;
  window_end: string;
  created_at: string;
}

interface RateLimitBlock {
  id: string;
  ip_address: string;
  endpoint: string;
  reason: string;
  blocked_until: string;
  created_at: string;
}

interface RateLimitViolation {
  id: string;
  ip_address: string;
  endpoint: string;
  violation_count: number;
  last_violation: string;
  block_duration: number;
}

export const RateLimitDashboard: React.FC = () => {
  const [entries, setEntries] = useState<RateLimitEntry[]>([]);
  const [blocks, setBlocks] = useState<RateLimitBlock[]>([]);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simular datos hasta que las tablas estén configuradas
      const mockEntries: RateLimitEntry[] = [
        {
          id: '1',
          ip_address: '192.168.1.1',
          endpoint: '/api/auth',
          request_count: 5,
          window_start: new Date().toISOString(),
          window_end: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      const mockBlocks: RateLimitBlock[] = [];
      const mockViolations: RateLimitViolation[] = [];

      setEntries(mockEntries);
      setBlocks(mockBlocks);
      setViolations(mockViolations);
    } catch (error) {
      console.error('Error loading rate limit data:', error);
      toast.error('Error al cargar datos de rate limiting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const unblockIP = async (ipAddress: string) => {
    try {
      toast.success(`IP ${ipAddress} desbloqueada (simulado)`);
      loadData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('Error al desbloquear IP');
    }
  };

  const blockIP = async (ipAddress: string, reason: string, hours: number = 24) => {
    try {
      toast.success(`IP ${ipAddress} bloqueada por ${hours} horas (simulado)`);
      loadData();
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast.error('Error al bloquear IP');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardHeader>
              <CardTitle>Cargando datos de rate limiting...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Requests Actuales</h3>
              <p className="text-2xl font-bold text-blue-700">{entries.length}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900">IPs Bloqueadas</h3>
              <p className="text-2xl font-bold text-red-700">{blocks.length}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900">Violaciones</h3>
              <p className="text-2xl font-bold text-yellow-700">{violations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2">IP</th>
                  <th className="border border-gray-300 p-2">Endpoint</th>
                  <th className="border border-gray-300 p-2">Requests</th>
                  <th className="border border-gray-300 p-2">Ventana</th>
                  <th className="border border-gray-300 p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="border border-gray-300 p-2">{entry.ip_address}</td>
                    <td className="border border-gray-300 p-2">{entry.endpoint}</td>
                    <td className="border border-gray-300 p-2">
                      <Badge variant={entry.request_count > 10 ? 'destructive' : 'default'}>
                        {entry.request_count}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 p-2">
                      {new Date(entry.window_start).toLocaleTimeString()}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => blockIP(entry.ip_address, 'Manual block', 24)}
                      >
                        Bloquear
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Blocks Table */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>IPs Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2">IP</th>
                    <th className="border border-gray-300 p-2">Razón</th>
                    <th className="border border-gray-300 p-2">Bloqueado hasta</th>
                    <th className="border border-gray-300 p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((block) => (
                    <tr key={block.id}>
                      <td className="border border-gray-300 p-2">{block.ip_address}</td>
                      <td className="border border-gray-300 p-2">{block.reason}</td>
                      <td className="border border-gray-300 p-2">
                        {new Date(block.blocked_until).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => unblockIP(block.ip_address)}
                        >
                          Desbloquear
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};