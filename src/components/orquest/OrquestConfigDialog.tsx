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
import { useToast } from '@/hooks/use-toast';

interface OrquestConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrquestConfigDialog: React.FC<OrquestConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [apiKey, setApiKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('https://api.orquest.com');
  const [enabled, setEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Aquí guardarías la configuración en la base de datos
      // o en las variables de entorno de Supabase
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de Orquest se ha guardado correctamente",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuración de Orquest</DialogTitle>
          <DialogDescription>
            Configura la integración con la API de Orquest
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API Key de Orquest"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="base-url">URL Base</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.orquest.com"
            />
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
            disabled={loading || !apiKey}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};