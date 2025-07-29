import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContacts } from '@/hooks/useContacts';
import { Contact, ContactType } from '@/types/contact';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact;
}

const contactTypeLabels: Record<ContactType, string> = {
  ingeniero: 'Ingeniero',
  arquitecto: 'Arquitecto',
  proveedor: 'Proveedor',
  tecnico: 'Técnico',
  constructor: 'Constructor',
  otro: 'Otro'
};

export const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onOpenChange,
  contact
}) => {
  const { createContact, updateContact } = useContacts();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    contact_type: 'proveedor' as ContactType,
    specialization: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        contact_type: contact.contact_type,
        specialization: contact.specialization || '',
        address: contact.address || '',
        notes: contact.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        contact_type: 'proveedor',
        specialization: '',
        address: '',
        notes: ''
      });
    }
  }, [contact, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contact) {
      updateContact.mutate({ id: contact.id, ...formData });
    } else {
      createContact.mutate(formData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_type">Tipo de Contacto *</Label>
              <Select
                value={formData.contact_type}
                onValueChange={(value: ContactType) => 
                  setFormData({ ...formData, contact_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contactTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="specialization">Especialización</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {contact ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};