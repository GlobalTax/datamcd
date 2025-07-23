import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useOrquestConfig } from '@/hooks/useOrquestConfig';

interface OrquestConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franchiseeId?: string;
}

export const OrquestConfigDialog: React.FC<OrquestConfigDialogProps> = ({
  open,
  onOpenChange,
  franchiseeId,
}) => {
  const { config, saveConfig, loading, error } = useOrquestConfig(franchiseeId);
  const [apiKey, setApiKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('https://pre-mc.orquest.es');
  const [businessId, setBusinessId] = React.useState('MCDONALDS_ES');
  const [enabled, setEnabled] = React.useState(true);
  
  // Detectar si estamos en modo fallback
  const isInFallbackMode = franchiseeId?.startsWith('fallback-') || false;
  const isValidUUID = franchiseeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(franchiseeId);
  const canSave = franchiseeId && isValidUUID && !isInFallbackMode && apiKey.trim();

  // Cargar configuración existente cuando se abre el diálogo
  React.useEffect(() => {
    if (open && config) {
      setApiKey(config.api_key || '');
      setBaseUrl(config.base_url || 'https://pre-mc.orquest.es');
      setBusinessId(config.business_id || 'MCDONALDS_ES');
      setEnabled(true);
    }
  }, [open, config]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      return;
    }

    const success = await saveConfig({
      api_key: apiKey,
      base_url: baseUrl,
      business_id: businessId,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuración de Orquest</DialogTitle>
          <DialogDescription>
            Configura la integración con la API de Orquest (McDonald's España)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key de Orquest</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API Key de Orquest"
            />
            <p className="text-xs text-muted-foreground">
              Esta API Key se usará para autenticar con el sistema Orquest
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="base-url">URL Base</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://pre-mc.orquest.es"
            />
            <p className="text-xs text-muted-foreground">
              URL del entorno de Orquest (producción o preproducción)
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="business-id">Business ID</Label>
            <Input
              id="business-id"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="MCDONALDS_ES"
            />
            <p className="text-xs text-muted-foreground">
              Identificador del negocio en Orquest
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="enabled">
              Habilitar sincronización automática
            </Label>
          </div>
        </div>

        {isInFallbackMode && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  No se puede guardar la configuración
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    El sistema está en modo de conectividad limitada. Por favor, verifica tu conexión a internet y recarga la página antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && !isInFallbackMode && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al guardar configuración
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || !canSave}
          >
            {loading ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};