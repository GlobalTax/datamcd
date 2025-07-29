import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Contact, ContactType } from '@/types/contact';

interface ContactsTableProps {
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const contactTypeLabels: Record<ContactType, string> = {
  ingeniero: 'Ingeniero',
  arquitecto: 'Arquitecto', 
  proveedor: 'Proveedor',
  tecnico: 'Técnico',
  constructor: 'Constructor',
  otro: 'Otro'
};

const contactTypeColors: Record<ContactType, string> = {
  ingeniero: 'bg-blue-100 text-blue-800',
  arquitecto: 'bg-purple-100 text-purple-800',
  proveedor: 'bg-green-100 text-green-800',
  tecnico: 'bg-orange-100 text-orange-800',
  constructor: 'bg-yellow-100 text-yellow-800',
  otro: 'bg-gray-100 text-gray-800'
};

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onEditContact,
  onDeleteContact
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Especialización</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>
                <Badge className={contactTypeColors[contact.contact_type]}>
                  {contactTypeLabels[contact.contact_type]}
                </Badge>
              </TableCell>
              <TableCell>{contact.company || '-'}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {contact.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{contact.specialization || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};