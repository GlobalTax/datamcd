
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/auth/AuthProvider";
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

// Placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">Esta página está en desarrollo</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
              <Route path="/orquest" element={
                <ProtectedRoute>
                  <OrquestPage />
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
              <Route path="/system-config" element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <SystemConfigPage />
                </ProtectedRoute>
              } />

              {/* Páginas placeholder temporales */}
              <Route path="/incidents" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Incidencias" />
                </ProtectedRoute>
              } />
              <Route path="/restaurant" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Restaurante" />
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
              <Route path="/workers" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Trabajadores" />
                </ProtectedRoute>
              } />
              <Route path="/advisor" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Panel Asesor" />
                </ProtectedRoute>
              } />
              <Route path="/historical-data" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Datos Históricos" />
                </ProtectedRoute>
              } />
              <Route path="/labor-dashboard" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Panel Laboral" />
                </ProtectedRoute>
              } />
              <Route path="/biloop" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Biloop" />
                </ProtectedRoute>
              } />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
