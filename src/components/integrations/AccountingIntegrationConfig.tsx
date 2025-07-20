
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calculator, 
  TestTube, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export const AccountingIntegrationConfig: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState('');
  const [credentials, setCredentials] = useState({
    server: '',
    database: '',
    username: '',
    password: '',
    apiKey: '',
    companyId: ''
  });
  const [syncOptions, setSyncOptions] = useState({
    revenue: true,
    expenses: true,
    payroll: true,
    taxes: true
  });
  const [testing, setTesting] = useState(false);

  const accountingSystems = [
    { value: 'quantum', label: 'Quantum Contabilidad' },
    { value: 'sage', label: 'Sage 50' },
    { value: 'contaplus', label: 'ContaPlus' },
    { value: 'a3', label: 'A3 Software' },
    { value: 'meta4', label: 'Meta4 Nómina' },
    { value: 'other', label: 'Otro sistema' }
  ];

  const handleSave = async () => {
    if (!selectedSystem) {
      toast.error('Por favor selecciona un sistema de contabilidad');
      return;
    }
    toast.success('Configuración de contabilidad guardada correctamente');
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast.success('Conexión con sistema de contabilidad verificada');
    } catch (error) {
      toast.error('Error al probar la conexión');
    } finally {
      setTesting(false);
    }
  };

  const renderCredentialFields = () => {
    if (!selectedSystem) return null;

    switch (selectedSystem) {
      case 'quantum':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="server">Servidor</Label>
                <Input
                  id="server"
                  placeholder="servidor.quantum.com"
                  value={credentials.server}
                  onChange={(e) => setCredentials(prev => ({ ...prev, server: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="database">Base de Datos</Label>
                <Input
                  id="database"
                  placeholder="EMPRESA_001"
                  value={credentials.database}
                  onChange={(e) => setCredentials(prev => ({ ...prev, database: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key o Token</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Tu clave de API"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyId">ID de Empresa</Label>
              <Input
                id="companyId"
                placeholder="ID único de tu empresa"
                value={credentials.companyId}
                onChange={(e) => setCredentials(prev => ({ ...prev, companyId: e.target.value }))}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-purple-600" />
            <div>
              <CardTitle>Sistema de Contabilidad</CardTitle>
              <CardDescription>
                Conecta tu software contable para automatizar el proceso financiero
              </CardDescription>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Advertencia
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="accounting-system">Sistema de Contabilidad</Label>
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu sistema contable" />
              </SelectTrigger>
              <SelectContent>
                {accountingSystems.map((system) => (
                  <SelectItem key={system.value} value={system.value}>
                    {system.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderCredentialFields()}

          {selectedSystem && (
            <div className="space-y-4">
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Opciones de Sincronización</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="revenue" 
                      checked={syncOptions.revenue}
                      onCheckedChange={(checked) => 
                        setSyncOptions(prev => ({ ...prev, revenue: !!checked }))
                      }
                    />
                    <Label htmlFor="revenue">Ingresos y Ventas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="expenses" 
                      checked={syncOptions.expenses}
                      onCheckedChange={(checked) => 
                        setSyncOptions(prev => ({ ...prev, expenses: !!checked }))
                      }
                    />
                    <Label htmlFor="expenses">Gastos Operativos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="payroll" 
                      checked={syncOptions.payroll}
                      onCheckedChange={(checked) => 
                        setSyncOptions(prev => ({ ...prev, payroll: !!checked }))
                      }
                    />
                    <Label htmlFor="payroll">Nómina</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="taxes" 
                      checked={syncOptions.taxes}
                      onCheckedChange={(checked) => 
                        setSyncOptions(prev => ({ ...prev, taxes: !!checked }))
                      }
                    />
                    <Label htmlFor="taxes">Impuestos y IVA</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={!selectedSystem}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTest} 
              disabled={testing || !selectedSystem}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
            
            <Button variant="secondary" disabled={!selectedSystem}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reportes Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Balance General</div>
                <div className="text-sm text-muted-foreground">Activos, pasivos y patrimonio</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Estado de Resultados</div>
                <div className="text-sm text-muted-foreground">Ingresos y gastos por período</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Flujo de Caja</div>
                <div className="text-sm text-muted-foreground">Movimientos de efectivo</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
