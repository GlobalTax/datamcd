
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/hooks/auth/useUnifiedAuth";
import { logger } from "@/lib/logger";

export const DebugSection = () => {
  const navigate = useNavigate();
  const { user, loading } = useUnifiedAuth();

  if (!user) return null;

  return (
    <div className="mb-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
      <p className="text-sm text-yellow-700">Usuario: {user.email}</p>
      <p className="text-sm text-yellow-700">Rol: {user.role}</p>
      <p className="text-sm text-yellow-700">Loading: {loading ? 'true' : 'false'}</p>
      <Button 
        onClick={() => {
          logger.userAction('Force dashboard redirect', user.id, { component: 'DebugSection' });
          navigate('/dashboard', { replace: true });
        }}
        className="mt-2 text-xs"
        size="sm"
      >
        Forzar redirección al Dashboard
      </Button>
    </div>
  );
};
