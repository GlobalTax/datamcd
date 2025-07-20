import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { 
  RefreshCw, 
  Search, 
  Filter,
  Download,
  Eye,
  Shield,
  User,
  Database,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7d');

  useEffect(() => {
    fetchAuditLogs();
  }, [dateFilter]);

  const fetchAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;
      setLogs(data?.map(log => ({
        ...log,
        old_values: log.old_values as Record<string, any> || undefined,
        new_values: log.new_values as Record<string, any> || undefined,
        ip_address: log.ip_address as string || undefined
      })) || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'create':
      case 'insert':
        return <Database className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Settings className="w-4 h-4 text-yellow-600" />;
      case 'delete':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'delete':
        return 'destructive';
      case 'create':
      case 'insert':
        return 'default';
      case 'update':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.table_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = actionFilter === 'all' || log.action_type.toLowerCase() === actionFilter.toLowerCase();
    return matchesSearch && matchesAction;
  });

  const columns = [
    {
      key: 'created_at',
      header: 'Fecha/Hora',
      render: (log: AuditLog) => new Date(log.created_at).toLocaleString()
    },
    {
      key: 'action_type',
      header: 'Acción',
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          {getActionIcon(log.action_type)}
          <Badge variant={getActionBadgeVariant(log.action_type)}>
            {log.action_type}
          </Badge>
        </div>
      )
    },
    {
      key: 'user_id',
      header: 'Usuario',
      render: (log: AuditLog) => (
        <span className="font-mono text-sm">{log.user_id.slice(0, 8)}...</span>
      )
    },
    {
      key: 'table_name',
      header: 'Tabla',
      render: (log: AuditLog) => log.table_name || '-'
    },
    {
      key: 'record_id',
      header: 'Registro',
      render: (log: AuditLog) => log.record_id ? (
        <span className="font-mono text-sm">{log.record_id.slice(0, 8)}...</span>
      ) : '-'
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (log: AuditLog) => log.ip_address || '-'
    },
    {
      key: 'changes',
      header: 'Cambios',
      render: (log: AuditLog) => {
        if (!log.old_values && !log.new_values) return '-';
        
        return (
          <div className="max-w-xs">
            {log.new_values && (
              <div className="text-xs text-green-600">
                + {Object.keys(log.new_values).length} campos
              </div>
            )}
            {log.old_values && (
              <div className="text-xs text-red-600">
                - {Object.keys(log.old_values).length} campos
              </div>
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando logs de auditoría...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Logs de Auditoría</h2>
          <p className="text-muted-foreground">Registro de todas las actividades y cambios del sistema</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Tipo de Acción</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Crear</SelectItem>
                  <SelectItem value="update">Actualizar</SelectItem>
                  <SelectItem value="delete">Eliminar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Último día</SelectItem>
                  <SelectItem value="7">Última semana</SelectItem>
                  <SelectItem value="30">Último mes</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="all">Todo el historial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => toast.info('Exportación disponible próximamente')}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">Total de logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredLogs.filter(log => log.action_type.toLowerCase() === 'login').length}
            </div>
            <p className="text-xs text-muted-foreground">Inicios de sesión</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(filteredLogs.map(log => log.user_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Usuarios únicos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredLogs.filter(log => ['update', 'delete'].includes(log.action_type.toLowerCase())).length}
            </div>
            <p className="text-xs text-muted-foreground">Modificaciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad ({filteredLogs.length} entradas)</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredLogs}
            columns={columns}
          />
        </CardContent>
      </Card>
    </div>
  );
};