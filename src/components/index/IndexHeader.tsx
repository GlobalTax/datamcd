
import { Button } from "@/components/ui/button";
import { Store, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/hooks/auth/useUnifiedAuth";

export const IndexHeader = () => {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();

  const handleUserRedirect = () => {
    console.log('IndexHeader - Manual navigation button clicked');
    try {
      console.log('IndexHeader - Manual redirect to /dashboard');
      navigate('/dashboard');
    } catch (error) {
      console.error('IndexHeader - Error in manual navigation:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">McDonald's Portal</h1>
              <p className="text-sm text-gray-500">Sistema de Gestión Integral</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hola, {user.full_name || user.email}</span>
                <Button 
                  onClick={handleUserRedirect}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Ir al Panel
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Store className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
