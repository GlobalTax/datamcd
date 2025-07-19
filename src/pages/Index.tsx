
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { useEffect, useCallback, useState } from "react";
import { IndexHeader } from "@/components/index/IndexHeader";
import { HeroSection } from "@/components/index/HeroSection";
import { DebugSection } from "@/components/index/DebugSection";
import { FeatureCards } from "@/components/index/FeatureCards";
import { FeatureHighlights } from "@/components/index/FeatureHighlights";
import { IndexFooter } from "@/components/index/IndexFooter";
import { LoadingSpinner } from "@/components/index/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  console.log('Index - Component rendered');
  console.log('Index - User:', user);
  console.log('Index - Loading:', loading);
  console.log('Index - HasNavigated:', hasNavigated);

  // Función memoizada para manejar la navegación
  const handleNavigation = useCallback(() => {
    if (!user || loading || hasNavigated) return;
    
    console.log('Index - Attempting navigation for role:', user.role);
    setHasNavigated(true);
    
    try {
      // Redirigir usuarios autenticados según su rol
      if (['asesor', 'admin', 'superadmin'].includes(user.role)) {
        console.log('Index - Redirecting asesor/admin/superadmin to /advisor');
        navigate('/advisor', { replace: true });
      } else if (user.role === 'franchisee') {
        console.log('Index - Redirecting franchisee to /dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('Index - Unknown role, staying on landing page:', user.role);
        setHasNavigated(false); // Reset para roles desconocidos
      }
    } catch (error) {
      console.error('Index - Error during navigation:', error);
      setHasNavigated(false); // Reset en caso de error
    }
  }, [user, loading, hasNavigated, navigate]);

  useEffect(() => {
    console.log('Index - useEffect triggered');
    console.log('Index - User in effect:', user);
    console.log('Index - Loading in effect:', loading);
    
    // Solo intentar navegar si no estamos cargando y no hemos navegado ya
    if (!loading) {
      if (user) {
        // Pequeño delay para evitar problemas de timing
        const timeoutId = setTimeout(handleNavigation, 100);
        return () => clearTimeout(timeoutId);
      } else {
        console.log('Index - No user found, showing landing page');
        setHasNavigated(false); // Reset cuando no hay usuario
      }
    }
  }, [user, loading, handleNavigation]);

  console.log('Index - About to render, loading state:', loading);

  // Mostrar loading mientras se determina el estado de autenticación
  if (loading) {
    console.log('Index - Rendering loading state');
    return <LoadingSpinner />;
  }

  console.log('Index - Rendering main content');

  return (
    <div className="min-h-screen bg-gray-50">
      <IndexHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HeroSection />
        <DebugSection />
        <FeatureCards />
        <FeatureHighlights />
      </div>

      <IndexFooter />
    </div>
  );
};

export default Index;
