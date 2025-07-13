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
}

export const OrquestConfigDialog: React.FC<OrquestConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { config, saveConfig, loading } = useOrquestConfig();
  const [apiKey, setApiKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('https://pre-mc.orquest.es');
  const [businessId, setBusinessId] = React.useState('MCDONALDS_ES');
  const [enabled, setEnabled] = React.useState(true);

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
            disabled={loading || !apiKey.trim()}
          >
            {loading ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};