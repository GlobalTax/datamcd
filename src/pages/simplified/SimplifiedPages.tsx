// Páginas simplificadas que eliminan verificaciones de role
import React from 'react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

// AdvisorAuthPage simplificado
export const SimplifiedAdvisorAuthPage = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

// AdvisorPage simplificado
export const SimplifiedAdvisorPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Asesor</h1>
      <p>Usuario autenticado como administrador: {user.full_name}</p>
    </div>
  );
};

// DashboardPage simplificado sin impersonation
export const SimplifiedDashboardPage = () => {
  const { user, franchisee } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-4">
        <p>Usuario: {user.full_name}</p>
        {franchisee && (
          <p>Franquiciado: {franchisee.franchisee_name}</p>
        )}
      </div>
    </div>
  );
};

// FranchiseeDetailPage simplificado
export const SimplifiedFranchiseeDetailPage = () => {
  const { user, franchisee } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Franquiciado</h1>
      {franchisee ? (
        <div>
          <p>Nombre: {franchisee.franchisee_name}</p>
          <p>Empresa: {franchisee.company_name}</p>
        </div>
      ) : (
        <p>Cargando información del franquiciado...</p>
      )}
    </div>
  );
};

// Index simplificado
export const SimplifiedIndex = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

// LaborDashboardPage simplificado
export const SimplifiedLaborDashboardPage = () => {
  const { user, franchisee } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Laboral</h1>
      {franchisee && (
        <p>Franquiciado: {franchisee.franchisee_name}</p>
      )}
    </div>
  );
};

// OptimizedDashboardPage simplificado
export const SimplifiedOptimizedDashboardPage = () => {
  const { user, franchisee } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Optimizado</h1>
      <div className="space-y-4">
        <p>Usuario: {user.full_name} - Administrador</p>
        {franchisee && (
          <p>Franquiciado: {franchisee.franchisee_name}</p>
        )}
      </div>
    </div>
  );
};

// RestaurantDetailPage simplificado
export const SimplifiedRestaurantDetailPage = () => {
  const { user, franchisee } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle del Restaurante</h1>
      {franchisee && (
        <p>Franquiciado: {franchisee.franchisee_name}</p>
      )}
    </div>
  );
};

// RestaurantManagementPage simplificado
export const SimplifiedRestaurantManagementPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Restaurantes</h1>
      <p>Usuario administrador: {user.full_name}</p>
    </div>
  );
};