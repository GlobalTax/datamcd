
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Plus, ArrowUpDown, Building2 } from 'lucide-react';
import { Franchisee } from '@/types/auth';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface FranchiseesTableProps {
  franchisees: Franchisee[];
  onEdit: (franchisee: Franchisee) => void;
  onDelete: (franchisee: Franchisee) => void;
  onAssignRestaurant: (franchisee: Franchisee) => void;
  onViewDetails: (franchisee: Franchisee) => void;
}

const ITEMS_PER_PAGE = 20;

export const FranchiseesTable: React.FC<FranchiseesTableProps> = ({
  franchisees,
  onEdit,
  onDelete,
  onAssignRestaurant,
  onViewDetails,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Franchisee>('franchisee_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sorting logic
  const sortedFranchisees = [...franchisees].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedFranchisees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFranchisees = sortedFranchisees.slice(startIndex, endIndex);

  const handleSort = (field: keyof Franchisee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (franchisee: Franchisee) => {
    const hasAccount = Boolean(franchisee.user_id);
    const hasRestaurants = (franchisee.total_restaurants || 0) > 0;

    if (hasAccount && hasRestaurants) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
    } else if (hasAccount && !hasRestaurants) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sin Restaurantes</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Sin Cuenta</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Mostrando {startIndex + 1}-{Math.min(endIndex, sortedFranchisees.length)} de {sortedFranchisees.length} franquiciados
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('franchisee_name')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Nombre
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('company_name')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Empresa
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>CIF/NIF</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('city')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Ciudad
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">Restaurantes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFranchisees.map((franchisee) => (
              <TableRow 
                key={franchisee.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onViewDetails(franchisee)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium text-gray-900">{franchisee.franchisee_name}</div>
                    {franchisee.profiles?.email && (
                      <div className="text-sm text-gray-500">{franchisee.profiles.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-900">{franchisee.company_name || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-700">{franchisee.tax_id || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-900">{franchisee.city || '-'}</div>
                  {franchisee.state && (
                    <div className="text-sm text-gray-500">{franchisee.state}</div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{franchisee.total_restaurants || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(franchisee)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(franchisee);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onAssignRestaurant(franchisee);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Asignar Restaurante
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(franchisee);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(franchisee);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 7) {
                  pageNumber = i + 1;
                } else if (currentPage <= 4) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNumber = totalPages - 6 + i;
                } else {
                  pageNumber = currentPage - 3 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
