import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/auth/AuthProvider";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Importar el nuevo dashboard unificado
import UnifiedDashboardPage from "./pages/UnifiedDashboardPage";

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

              {/* Temporary placeholder routes until pages are implemented */}
              <Route path="/annual-budget" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Presupuesto Anual" />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Empleados" />
                </ProtectedRoute>
              } />
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
              <Route path="/settings" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Configuración" />
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
              <Route path="/orquest" element={
                <ProtectedRoute>
                  <PlaceholderPage title="Orquest" />
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
