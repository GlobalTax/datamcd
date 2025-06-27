import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthProvider";
import { useEffect } from "react";
import { IndexHeader } from "@/components/index/IndexHeader";
import { HeroSection } from "@/components/index/HeroSection";
import { DebugSection } from "@/components/index/DebugSection";
import { FeatureCards } from "@/components/index/FeatureCards";
import { FeatureHighlights } from "@/components/index/FeatureHighlights";
import { IndexFooter } from "@/components/index/IndexFooter";
import { LoadingSpinner } from "@/components/index/LoadingSpinner";
import { RealDataStatus } from '@/components/index/RealDataStatus';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Index - Component rendered');
  console.log('Index - User:', user);
  console.log('Index - Loading:', loading);

  useEffect(() => {
    console.log('Index - useEffect triggered');
    console.log('Index - User in effect:', user);
    console.log('Index - Loading in effect:', loading);
    
    if (user && !loading) {
      console.log('Index - User authenticated, redirecting based on role:', user.role);
      
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
        }
      } catch (error) {
        console.error('Index - Error during navigation:', error);
      }
    } else if (!loading) {
      console.log('Index - No user found, showing landing page');
    }
  }, [user, loading, navigate]);

  console.log('Index - About to render, loading state:', loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      <IndexHeader />

      <main className="container mx-auto px-4 py-12">
        {user && <RealDataStatus />}
        
        {!user ? (
          <>
            <HeroSection />
            <DebugSection />
            <FeatureCards />
            <FeatureHighlights />
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Tu aplicación está funcionando con datos reales de Supabase
            </p>
          </div>
        )}
      </main>

      <IndexFooter />
    </div>
  );
}
