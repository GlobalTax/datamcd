import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Users, CheckCircle, AlertCircle, User, Key } from 'lucide-react';
import { Franchisee } from '@/types/auth';
import { useUserCreation } from '@/hooks/useUserCreation';
import { toast } from 'sonner';

interface MassUserCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  franchisees: Franchisee[];
  onRefresh: () => void;
}

interface CreationResult {
  franchiseeId: string;
  franchiseeName: string;
  email: string;
  password: string;
  success: boolean;
  error?: string;
}

export const MassUserCreationDialog: React.FC<MassUserCreationDialogProps> = ({
  isOpen,
  onClose,
  franchisees,
  onRefresh
}) => {
  const { createUser, creating } = useUserCreation();
  
  // Filtrar franquiciados sin cuenta (user_id es null)
  const franchiseesWithoutAccount = franchisees.filter(f => !f.user_id);
  
  const [selectedFranchisees, setSelectedFranchisees] = useState<string[]>([]);
  const [emailDomain, setEmailDomain] = useState('@mcdonalds-es.com');
  const [step, setStep] = useState<'selection' | 'creation' | 'results'>('selection');
  const [results, setResults] = useState<CreationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentlyCreating, setCurrentlyCreating] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFranchisees([]);
      setStep('selection');
      setResults([]);
      setProgress(0);
      setCurrentlyCreating('');
    }
  }, [isOpen]);

  const generateEmail = (franchiseeName: string) => {
    return franchiseeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + emailDomain;
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSelectAll = () => {
    if (selectedFranchisees.length === franchiseesWithoutAccount.length) {
      setSelectedFranchisees([]);
    } else {
      setSelectedFranchisees(franchiseesWithoutAccount.map(f => f.id));
    }
  };

  const handleSelectFranchisee = (franchiseeId: string) => {
    setSelectedFranchisees(prev => 
      prev.includes(franchiseeId)
        ? prev.filter(id => id !== franchiseeId)
        : [...prev, franchiseeId]
    );
  };

  const handleCreateUsers = async () => {
    setStep('creation');
    setResults([]);
    setProgress(0);
    
    const selectedFranchiseesData = franchiseesWithoutAccount.filter(f => 
      selectedFranchisees.includes(f.id)
    );
    
    const creationResults: CreationResult[] = [];
    
    for (let i = 0; i < selectedFranchiseesData.length; i++) {
      const franchisee = selectedFranchiseesData[i];
      const email = generateEmail(franchisee.franchisee_name);
      const password = generatePassword();
      
      setCurrentlyCreating(franchisee.franchisee_name);
      setProgress(((i + 1) / selectedFranchiseesData.length) * 100);
      
      try {
        const success = await createUser(
          email,
          password,
          franchisee.franchisee_name,
          'franchisee',
          franchisee.id
        );
        
        creationResults.push({
          franchiseeId: franchisee.id,
          franchiseeName: franchisee.franchisee_name,
          email,
          password,
          success
        });
      } catch (error) {
        creationResults.push({
          franchiseeId: franchisee.id,
          franchiseeName: franchisee.franchisee_name,
          email,
          password,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setResults(creationResults);
    setStep('results');
    setCurrentlyCreating('');
    
    const successCount = creationResults.filter(r => r.success).length;
    const errorCount = creationResults.length - successCount;
    
    if (successCount > 0) {
      toast.success(`${successCount} usuarios creados exitosamente`);
      onRefresh();
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} usuarios no pudieron ser creados`);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      'Franquiciado,Email,Contraseña,Estado,Error',
      ...results.map(r => 
        `"${r.franchiseeName}","${r.email}","${r.password}","${r.success ? 'Creado' : 'Error'}","${r.error || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `credenciales_franquiciados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    if (step === 'creation') return; // Prevent closing during creation
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Creación Masiva de Perfiles
          </DialogTitle>
        </DialogHeader>

        {step === 'selection' && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Se encontraron <strong>{franchiseesWithoutAccount.length}</strong> franquiciados sin cuenta de usuario.
                Selecciona los que deseas crear automáticamente.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="emailDomain">Dominio de email</Label>
              <Input
                id="emailDomain"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                placeholder="@mcdonalds-es.com"
              />
              <p className="text-sm text-gray-500">
                Se generarán emails automáticamente usando el nombre del franquiciado + este dominio
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Franquiciados sin cuenta ({franchiseesWithoutAccount.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedFranchisees.length === franchiseesWithoutAccount.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </Button>
              </div>

              <div className="border rounded-lg max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedFranchisees.length === franchiseesWithoutAccount.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Franquiciado</TableHead>
                      <TableHead>Email Propuesto</TableHead>
                      <TableHead>Restaurantes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {franchiseesWithoutAccount.map((franchisee) => (
                      <TableRow key={franchisee.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFranchisees.includes(franchisee.id)}
                            onCheckedChange={() => handleSelectFranchisee(franchisee.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {franchisee.franchisee_name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {generateEmail(franchisee.franchisee_name)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {franchisee.total_restaurants || 0} restaurantes
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateUsers}
                disabled={selectedFranchisees.length === 0}
                className="bg-red-600 hover:bg-red-700"
              >
                Crear {selectedFranchisees.length} Usuarios
              </Button>
            </div>
          </div>
        )}

        {step === 'creation' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Creando usuarios...</h3>
              <Progress value={progress} className="w-full mb-4" />
              <p className="text-sm text-gray-600">
                Creando cuenta para: <strong>{currentlyCreating}</strong>
              </p>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Creados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.success).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">Errores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">
                      {results.filter(r => !r.success).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-2xl font-bold">{results.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Resultados detallados</h3>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Credenciales
                </Button>
              </div>

              <div className="border rounded-lg max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Franquiciado</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contraseña</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.franchiseeId}>
                        <TableCell>
                          {result.success ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Creado
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.franchiseeName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {result.email}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          <div className="flex items-center gap-2">
                            <Key className="w-3 h-3" />
                            {result.password}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-red-600">
                          {result.error}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};