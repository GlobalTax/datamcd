
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/auth/AuthProvider";
import { ImpersonationProvider } from "./hooks/useImpersonation";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Importar el nuevo dashboard unificado
import UnifiedDashboardPage from "./pages/UnifiedDashboardPage";

// Importar páginas reales existentes
import OrquestPage from "./pages/OrquestPage";
import EmployeePage from "./pages/EmployeePage";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import SettingsPage from "./pages/SettingsPage";
import SystemConfigPage from "./pages/SystemConfigPage";

// Importar páginas de restaurantes
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";

// Importar nueva página de Gestión de Franquiciados
import FranchiseesPage from "./pages/FranchiseesPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import AdvisorPage from "./pages/AdvisorPage";

// Importar páginas de integraciones
import IntegrationsPage from "./pages/IntegrationsPage";
import IntegrationStatusPage from "./pages/IntegrationStatusPage";
import BiloopPage from "./pages/BiloopPage";

// Placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">Esta página está en desarrollo</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ImpersonationProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                {/* Auth Route */}
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Main Dashboard - Ahora usa el dashboard unificado */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UnifiedDashboardPage />
                  </ProtectedRoute>
                } />

                {/* Páginas reales existentes */}
                <Route path="/annual-budget" element={
                  <ProtectedRoute>
                    <AnnualBudgetPage />
                  </ProtectedRoute>
                } />
                <Route path="/employees" element={
                  <ProtectedRoute>
                    <EmployeePage />
                  </ProtectedRoute>
                } />
                <Route path="/profit-loss/:siteNumber" element={
                  <ProtectedRoute>
                    <ProfitLossPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />

                {/* Nueva página de Dashboard de Restaurantes */}
                <Route path="/restaurant" element={
                  <ProtectedRoute>
                    <RestaurantDashboardPage />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para gestión detallada de restaurantes */}
                <Route path="/restaurant/manage" element={
                  <ProtectedRoute>
                    <RestaurantManagementPage />
                  </ProtectedRoute>
                } />

                {/* Estado de integraciones (para franquiciados) */}
                <Route path="/integration-status" element={
                  <ProtectedRoute>
                    <IntegrationStatusPage />
                  </ProtectedRoute>
                } />

                {/* SECCIÓN DE ADMINISTRACIÓN - Solo para admins */}
                <Route path="/system-config" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <SystemConfigPage />
                  </ProtectedRoute>
                } />

                {/* Página de Gestión de Franquiciados */}
                <Route path="/franchisees" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <FranchiseesPage />
                  </ProtectedRoute>
                } />
                
                {/* Detalle de Franquiciado */}
                <Route path="/franchisees/:franchiseeId" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <FranchiseeDetailPage />
                  </ProtectedRoute>
                } />

                {/* Integraciones Externas (para administradores) */}
                <Route path="/integrations" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <IntegrationsPage />
                  </ProtectedRoute>
                } />

                {/* Orquest (solo administradores) */}
                <Route path="/orquest" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <OrquestPage />
                  </ProtectedRoute>
                } />

                {/* Biloop (solo administradores) */}
                <Route path="/biloop" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <BiloopPage />
                  </ProtectedRoute>
                } />

                {/* Advisor Page */}
                <Route path="/advisor" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdvisorPage />
                  </ProtectedRoute>
                } />
                
                {/* Detalle de Franquiciado desde Advisor */}
                <Route path="/advisor/franchisee/:franchiseeId" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <FranchiseeDetailPage />
                  </ProtectedRoute>
                } />

                {/* Páginas placeholder temporales restantes */}
                <Route path="/incidents" element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Incidencias" />
                  </ProtectedRoute>
                } />
                <Route path="/valuation" element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Valoración" />
                  </ProtectedRoute>
                } />
                <Route path="/profit-loss" element={
                  <ProtectedRoute>
                    <PlaceholderPage title="P&L" />
                  </ProtectedRoute>
                } />
                <Route path="/analysis" element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Análisis" />
                  </ProtectedRoute>
                } />
                <Route path="/historical-data" element={
                  <ProtectedRoute>
                    <PlaceholderPage title="Datos Históricos" />
                  </ProtectedRoute>
                } />

                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ImpersonationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
