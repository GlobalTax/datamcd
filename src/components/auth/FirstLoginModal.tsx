import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useInputValidation } from '@/hooks/useInputValidation';

interface FirstLoginModalProps {
  isOpen: boolean;
  userEmail: string;
  onPasswordChanged: () => void;
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({
  isOpen,
  userEmail,
  onPasswordChanged
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { validatePassword } = useInputValidation();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      toast.error(validation.error || 'Contraseña no válida');
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false }
      });

      if (error) {
        toast.error('Error al actualizar la contraseña: ' + error.message);
        return;
      }

      toast.success('Contraseña actualizada correctamente');
      onPasswordChanged();
    } catch (error) {
      toast.error('Error inesperado al actualizar la contraseña');
    } finally {
      setIsUpdating(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden">{/* Ocultar botón de cerrar con CSS */}
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <DialogTitle>Cambio de Contraseña Obligatorio</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Usuario:</strong> {userEmail}</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className={`pr-10 ${
                    newPassword && !passwordValidation.valid ? 'border-red-500' : 
                    passwordValidation.valid ? 'border-green-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {newPassword && !passwordValidation.valid && (
                <p className="text-xs text-red-600">{passwordValidation.error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                  className={`pr-10 ${
                    confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 
                    confirmPassword && newPassword === confirmPassword ? 'border-green-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isUpdating || !passwordValidation.valid || newPassword !== confirmPassword}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};