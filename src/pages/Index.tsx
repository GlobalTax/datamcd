
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
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
