
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/contexts/auth";
import { useEffect, useCallback, useState } from "react";
import { IndexHeader } from "@/components/index/IndexHeader";
import { HeroSection } from "@/components/index/HeroSection";
import { FeatureCards } from "@/components/index/FeatureCards";
import { FeatureHighlights } from "@/components/index/FeatureHighlights";
import { IndexFooter } from "@/components/index/IndexFooter";
import { LoadingSpinner } from "@/components/index/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useUnifiedAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  // Función memoizada para manejar la navegación
  const handleNavigation = useCallback(() => {
    if (!user || loading || hasNavigated) return;
    
    setHasNavigated(true);
    
    try {
      // Redirigir usuarios autenticados según su rol
      if (['asesor', 'admin', 'superadmin'].includes(user.role)) {
        navigate('/advisor', { replace: true });
      } else if (user.role === 'franchisee') {
        navigate('/dashboard', { replace: true });
      } else {
        // Reset para roles desconocidos
        setHasNavigated(false);
      }
    } catch (error) {
      console.error('Error durante navegación:', error);
      setHasNavigated(false);
    }
  }, [user, loading, hasNavigated, navigate]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Pequeño delay para evitar problemas de timing
        const timeoutId = setTimeout(handleNavigation, 100);
        return () => clearTimeout(timeoutId);
      } else {
        setHasNavigated(false);
      }
    }
  }, [user, loading, handleNavigation]);

  // Mostrar loading mientras se determina el estado de autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IndexHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HeroSection />
        <FeatureCards />
        <FeatureHighlights />
      </div>

      <IndexFooter />
    </div>
  );
};

export default Index;
