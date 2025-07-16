import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { BiloopEmployee } from '@/hooks/useBiloop';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface A3TransformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: BiloopEmployee[];
  onTransform: (employees: BiloopEmployee[], format: 'a3nom' | 'a3eco' | 'a3') => Promise<string>;
}

export const A3TransformDialog: React.FC<A3TransformDialogProps> = ({
  open,
  onOpenChange,
  employees,
  onTransform,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'a3nom' | 'a3eco' | 'a3'>('a3nom');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const formatOptions = [
    {
      value: 'a3nom' as const,
      label: 'A3NOM',
      description: 'Formato para gestión de nóminas',
    },
    {
      value: 'a3eco' as const,
      label: 'A3ECO',
      description: 'Formato para gestión económica',
    },
    {
      value: 'a3' as const,
      label: 'A3',
      description: 'Formato general A3',
    },
  ];

  const handleTransform = async () => {
    if (employees.length === 0) return;

    setLoading(true);
    setResult(null);

    try {
      const transformResult = await onTransform(employees, selectedFormat);
      setResult(transformResult);
    } catch (error) {
      console.error('Error transforming employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empleados_${selectedFormat}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transformar a Formato A3</DialogTitle>
          <DialogDescription>
            Convierte los datos de empleados de Biloop al formato A3 seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {employees.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay empleados de Biloop disponibles para transformar.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Empleados a transformar: {employees.length}
                </Label>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Formato de salida:</Label>
                  <RadioGroup
                    value={selectedFormat}
                    onValueChange={(value) => setSelectedFormat(value as any)}
                  >
                    {formatOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={option.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {result && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-green-600">
                    ✓ Transformación completada
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                      Archivo generado ({selectedFormat.toUpperCase()})
                    </p>
                    <Button 
                      onClick={handleDownload}
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar archivo TXT
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!result && employees.length > 0 && (
            <Button 
              onClick={handleTransform}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              {loading ? 'Transformando...' : 'Transformar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};