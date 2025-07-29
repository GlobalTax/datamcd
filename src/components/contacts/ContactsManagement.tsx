import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { ContactDialog } from './ContactDialog';
import { ContactsTable } from './ContactsTable';
import { Contact, ContactType } from '@/types/contact';

const contactTypeLabels: Record<ContactType, string> = {
  ingeniero: 'Ingeniero',
  arquitecto: 'Arquitecto',
  proveedor: 'Proveedor',
  tecnico: 'Técnico',
  constructor: 'Constructor',
  otro: 'Otro'
};

export const ContactsManagement: React.FC = () => {
  const { contacts = [], isLoading, deleteContact } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ContactType | 'all'>('all');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || contact.contact_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleNewContact = () => {
    setSelectedContact(undefined);
    setShowDialog(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDialog(true);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      deleteContact.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setSelectedContact(undefined);
  };

  if (isLoading) {
    return <div>Cargando contactos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Contactos</h2>
        <Button onClick={handleNewContact}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={(value: ContactType | 'all') => setFilterType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(contactTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Contactos ({filteredContacts.length})
            </h3>
          </div>
          
          <ContactsTable
            contacts={filteredContacts}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />
        </div>
      </div>

      <ContactDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        contact={selectedContact}
      />
    </div>
  );
};