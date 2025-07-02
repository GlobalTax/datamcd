
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { IndexHeader } from "@/components/index/IndexHeader";
import { HeroSection } from "@/components/index/HeroSection";
import { FeatureCards } from "@/components/index/FeatureCards";
import { FeatureHighlights } from "@/components/index/FeatureHighlights";
import { IndexFooter } from "@/components/index/IndexFooter";
import { LoadingSpinner } from "@/components/index/LoadingSpinner";
import SimpleAuthDebugger from "@/components/debug/SimpleAuthDebugger";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, refreshData, forceRoleUpdate } = useAuth();

  console.log('Index - Component rendered');
  console.log('Index - User:', user);
  console.log('Index - Loading:', loading);

  useEffect(() => {
    console.log('Index - useEffect triggered');
    console.log('Index - User in effect:', user ? {
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name
    } : null);
    console.log('Index - Loading in effect:', loading);
    
    if (user && !loading) {
      console.log('Index - User authenticated, checking role for redirection');
      console.log('Index - User role:', user.role);
      console.log('Index - Is asesor role?', ['asesor', 'admin', 'superadmin'].includes(user.role));
      console.log('Index - Is franchisee role?', user.role === 'franchisee');
      
      try {
        if (['asesor', 'admin', 'superadmin'].includes(user.role)) {
          console.log('Index - ✅ REDIRECTING asesor/admin/superadmin to /advisor');
          navigate('/advisor', { replace: true });
        } else if (user.role === 'franchisee') {
          console.log('Index - ✅ REDIRECTING franchisee to /dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Index - ⚠️ UNKNOWN ROLE, staying on landing page:', user.role);
          console.log('Index - Available roles should be: asesor, admin, superadmin, franchisee');
        }
      } catch (error) {
        console.error('Index - ❌ ERROR during navigation:', error);
      }
    } else if (!loading) {
      console.log('Index - No user found, showing landing page');
    } else {
      console.log('Index - Still loading user data...');
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
        
        {/* Panel de Debug Temporal */}
        {user && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">🐛 Panel de Debug - Usuario Autenticado</h3>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nombre:</strong> {user.full_name}</p>
              <p><strong>Rol actual:</strong> <span className="bg-yellow-100 px-2 py-1 rounded font-mono">{user.role}</span></p>
              <p><strong>Debería ir a:</strong> {['asesor', 'admin', 'superadmin'].includes(user.role) ? '/advisor' : '/dashboard'}</p>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button 
                onClick={() => {
                  console.log('Manual refresh triggered');
                  refreshData();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                🔄 Refrescar Datos
              </button>
              <button 
                onClick={async () => {
                  console.log('Manual role update triggered from Index page');
                  const success = await forceRoleUpdate();
                  if (success) {
                    console.log('Role update successful, user data refreshed');
                    
                    // Mostrar notificación de éxito
                    const notification = document.createElement('div');
                    notification.innerHTML = '✅ Rol actualizado correctamente';
                    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                    document.body.appendChild(notification);
                    
                    // Verificar y redirigir según el nuevo rol
                    setTimeout(() => {
                      console.log('Checking user role for redirect after update');
                      console.log('Current user role:', user?.role);
                      
                      if (user && ['asesor', 'admin', 'superadmin'].includes(user.role)) {
                        console.log('Redirecting to /advisor');
                        navigate('/advisor', { replace: true });
                      } else if (user && user.role === 'franchisee') {
                        console.log('User is franchisee, redirecting to /dashboard');
                        navigate('/dashboard', { replace: true });
                      }
                      
                      // Remover notificación después de 3 segundos
                      setTimeout(() => {
                        if (notification.parentNode) {
                          notification.parentNode.removeChild(notification);
                        }
                      }, 3000);
                    }, 1000);
                  } else {
                    console.error('Role update failed');
                    
                    // Mostrar notificación de error
                    const notification = document.createElement('div');
                    notification.innerHTML = '❌ Error al actualizar el rol';
                    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
                    document.body.appendChild(notification);
                    
                    // Remover notificación después de 3 segundos
                    setTimeout(() => {
                      if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                      }
                    }, 3000);
                  }
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm font-semibold"
              >
                🚀 Actualizar Rol
              </button>
              <button 
                onClick={() => {
                  console.log('Manual navigation to /advisor');
                  navigate('/advisor');
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
              >
                📍 Ir a /advisor
              </button>
              <button 
                onClick={() => {
                  console.log('Manual navigation to /dashboard');
                  navigate('/dashboard');
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
              >
                📍 Ir a /dashboard
              </button>
            </div>
          </div>
        )}
        
        {/* Mostrar depurador si hay usuario */}
        {user && (
          <div className="mb-8">
            <SimpleAuthDebugger />
          </div>
        )}
        
        <FeatureCards />
        <FeatureHighlights />
      </div>

      <IndexFooter />
    </div>
  );
};

export default Index;
