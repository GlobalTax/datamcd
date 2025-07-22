
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Ban, 
  Trash2, 
  RefreshCw,
  Search,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  created_at: string;
}

export const RateLimitDashboard: React.FC = () => {
  const [entries, setEntries] = useState<RateLimitEntry[]>([]);
  const [blocks, setBlocks] = useState<RateLimitBlock[]>([]);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'entries' | 'blocks' | 'violations'>('entries');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesResult, blocksResult, violationsResult] = await Promise.all([
        supabase.from('rate_limit_entries').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('rate_limit_blocks').select('*').order('created_at', { ascending: false }),
        supabase.from('rate_limit_violations').select('*').order('last_violation', { ascending: false })
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (blocksResult.error) throw blocksResult.error;
      if (violationsResult.error) throw violationsResult.error;

      setEntries(entriesResult.data || []);
      setBlocks(blocksResult.data || []);
      setViolations(violationsResult.data || []);
    } catch (error) {
      console.error('Error loading rate limit data:', error);
      toast.error('Error al cargar datos de rate limiting');
    } finally {
      setLoading(false);
    }
  };

  const unblockIP = async (ipAddress: string) => {
    try {
      const { error } = await supabase
        .from('rate_limit_blocks')
        .delete()
        .eq('ip_address', ipAddress);

      if (error) throw error;

      toast.success(`IP ${ipAddress} desbloqueada`);
      loadData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('Error al desbloquear IP');
    }
  };

  const blockIP = async (ipAddress: string, reason: string, hours: number = 24) => {
    try {
      const blockedUntil = new Date();
      blockedUntil.setHours(blockedUntil.getHours() + hours);

      const { error } = await supabase
        .from('rate_limit_blocks')
        .insert({
          ip_address: ipAddress,
          reason,
          blocked_until: blockedUntil.toISOString()
        });

      if (error) throw error;

      toast.success(`IP ${ipAddress} bloqueada por ${hours} horas`);
      loadData();
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast.error('Error al bloquear IP');
    }
  };

  const clearOldEntries = async () => {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { error } = await supabase
        .from('rate_limit_entries')
        .delete()
        .lt('created_at', twentyFourHoursAgo.toISOString());

      if (error) throw error;

      toast.success('Entradas antiguas eliminadas');
      loadData();
    } catch (error) {
      console.error('Error clearing old entries:', error);
      toast.error('Error al limpiar entradas antiguas');
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.ip_address.includes(searchTerm) || entry.endpoint.includes(searchTerm)
  );

  const filteredBlocks = blocks.filter(block =>
    block.ip_address.includes(searchTerm) || block.reason.includes(searchTerm)
  );

  const filteredViolations = violations.filter(violation =>
    violation.ip_address.includes(searchTerm) || violation.endpoint.includes(searchTerm)
  );

  const getStatusBadge = (count: number, limit: number = 100) => {
    const ratio = count / limit;
    if (ratio >= 0.9) return <Badge variant="destructive">Crítico</Badge>;
    if (ratio >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  const isBlocked = (ipAddress: string) => {
    return blocks.some(block => 
      block.ip_address === ipAddress && 
      new Date(block.blocked_until) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Rate Limiting Dashboard</h2>
          <p className="text-muted-foreground">
            Monitoreo y gestión del sistema de rate limiting
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={clearOldEntries} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Antiguas
          </Button>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Requests Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ban className="w-4 h-4" />
              IPs Bloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {blocks.filter(b => new Date(b.blocked_until) > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">Actualmente</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Violaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{violations.length}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Estado Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Activo
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Funcionando</p>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Buscar por IP o endpoint</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="192.168.1.1 o /api/auth"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={selectedTab === 'entries' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('entries')}
        >
          Requests ({filteredEntries.length})
        </Button>
        <Button
          variant={selectedTab === 'blocks' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('blocks')}
        >
          Bloqueadas ({filteredBlocks.length})
        </Button>
        <Button
          variant={selectedTab === 'violations' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('violations')}
        >
          Violaciones ({filteredViolations.length})
        </Button>
      </div>

      {/* Contenido de tabs */}
      {selectedTab === 'entries' && (
        <Card>
          <CardHeader>
            <CardTitle>Requests Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ventana</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono">{entry.ip_address}</TableCell>
                    <TableCell>{entry.endpoint}</TableCell>
                    <TableCell>{entry.request_count}</TableCell>
                    <TableCell>{getStatusBadge(entry.request_count)}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.window_start).toLocaleTimeString()} - 
                        {new Date(entry.window_end).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isBlocked(entry.ip_address) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unblockIP(entry.ip_address)}
                          >
                            Desbloquear
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => blockIP(entry.ip_address, 'Manual block from dashboard')}
                          >
                            Bloquear
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'blocks' && (
        <Card>
          <CardHeader>
            <CardTitle>IPs Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead>Bloqueada hasta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlocks.map((block) => {
                  const isActive = new Date(block.blocked_until) > new Date();
                  return (
                    <TableRow key={block.id}>
                      <TableCell className="font-mono">{block.ip_address}</TableCell>
                      <TableCell>{block.reason}</TableCell>
                      <TableCell>
                        {new Date(block.blocked_until).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'destructive' : 'secondary'}>
                          {isActive ? 'Activo' : 'Expirado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unblockIP(block.ip_address)}
                          >
                            Desbloquear
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'violations' && (
        <Card>
          <CardHeader>
            <CardTitle>Violaciones de Rate Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Violaciones</TableHead>
                  <TableHead>Última violación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-mono">{violation.ip_address}</TableCell>
                    <TableCell>{violation.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant={violation.violation_count > 5 ? 'destructive' : 'secondary'}>
                        {violation.violation_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(violation.last_violation).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => blockIP(violation.ip_address, `Multiple violations: ${violation.violation_count}`)}
                        disabled={isBlocked(violation.ip_address)}
                      >
                        {isBlocked(violation.ip_address) ? 'Bloqueada' : 'Bloquear'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
