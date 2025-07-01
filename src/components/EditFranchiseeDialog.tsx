
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Franchisee } from '@/hooks/useFranchisees';

interface EditFranchiseeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  franchisee: Franchisee | null;
  onUpdate: (id: string, data: Partial<Franchisee>) => Promise<void>;
}

export const EditFranchiseeDialog: React.FC<EditFranchiseeDialogProps> = ({
  isOpen,
  onOpenChange,
  franchisee,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    franchisee_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (franchisee) {
      setFormData({
        franchisee_name: franchisee.franchisee_name || '',
        contact_email: franchisee.contact_email || '',
        contact_phone: franchisee.contact_phone || '',
        address: franchisee.address || '',
        city: franchisee.city || '',
        state: franchisee.state || '',
        zip_code: franchisee.zip_code || '',
        notes: franchisee.notes || ''
      });
    }
  }, [franchisee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchisee) return;
    
    try {
      setLoading(true);
      await onUpdate(franchisee.id, formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Franquiciado</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="franchisee_name">Nombre del Franquiciado</Label>
            <Input
              id="franchisee_name"
              value={formData.franchisee_name}
              onChange={(e) => setFormData(prev => ({ ...prev, franchisee_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Email de Contacto</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zip_code">Código Postal</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
