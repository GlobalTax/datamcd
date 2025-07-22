
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  comingSoon?: boolean;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = "Esta página está en desarrollo",
  comingSoon = true 
}) => {
  const navigate = useNavigate();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="outline" 
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Construction className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {comingSoon 
              ? "Esta funcionalidad estará disponible próximamente. Estamos trabajando para ofrecerte la mejor experiencia."
              : description
            }
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </main>
    </>
  );
};
