export type ContactType = 'ingeniero' | 'arquitecto' | 'proveedor' | 'tecnico' | 'constructor' | 'otro';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type: ContactType;
  specialization?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type: ContactType;
  specialization?: string;
  address?: string;
  notes?: string;
}

export interface UpdateContactData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type?: ContactType;
  specialization?: string;
  address?: string;
  notes?: string;
  is_active?: boolean;
}