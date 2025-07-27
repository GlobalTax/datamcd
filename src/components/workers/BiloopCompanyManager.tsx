import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Building2, Star, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useBiloopCompanies, type CreateBiloopCompanyData } from '@/hooks/useBiloopCompanies';

interface BiloopCompanyManagerProps {
  franchiseeId: string;
}

export const BiloopCompanyManager: React.FC<BiloopCompanyManagerProps> = ({ franchiseeId }) => {
  const {
    companies,
    loading,
    addCompany,
    setPrimaryCompany,
    deactivateCompany,
    hasMultipleCompanies,
  } = useBiloopCompanies(franchiseeId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState('');

  const handleAddCompany = async () => {
    if (!newCompanyId.trim()) return;

    const result = await addCompany({
      biloop_company_id: newCompanyId.trim(),
      company_name: newCompanyId.trim(),
      is_primary: companies.length === 0
    }, franchiseeId);
    
    if (result) {
      setNewCompanyId('');
      setIsAddDialogOpen(false);
    }
  };

  const handleSetPrimary = async (companyId: string) => {
    await setPrimaryCompany(companyId);
  };

  const handleDeactivate = async (companyId: string) => {
    await deactivateCompany(companyId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresas de Biloop
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nueva Empresa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_id">Company ID de Biloop</Label>
                  <Input
                    id="company_id"
                    value={newCompanyId}
                    onChange={(e) => setNewCompanyId(e.target.value)}
                    placeholder="Ej: 2005 CASTELL"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCompany} disabled={loading}>
                    Añadir
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay empresas configuradas</p>
            <p className="text-sm">Añade una empresa para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{company.biloop_company_id}</h4>
                    {company.is_primary && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Principal
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!company.is_primary && hasMultipleCompanies() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(company.id)}
                      disabled={loading}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Hacer Principal
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar empresa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que quieres desactivar la empresa "{company.biloop_company_id}"? 
                          Esta acción se puede revertir más tarde.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeactivate(company.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Desactivar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};