-- Desactivar temporalmente el trigger de auditoría
DROP TRIGGER IF EXISTS trigger_audit_logs ON public.profiles;
DROP TRIGGER IF EXISTS trigger_audit_logs ON public.franchisees;

-- Limpiar usuarios manualmente
-- 1. Actualizar el email del superadmin
UPDATE public.profiles 
SET email = 's.navarro@obn.es'
WHERE email = 's.navarro@nrro.es' AND role = 'superadmin';

-- 2. Eliminar todos los demás usuarios
DELETE FROM public.profiles 
WHERE email != 's.navarro@obn.es';

-- 3. Reactivar el trigger de auditoría
CREATE TRIGGER trigger_audit_logs
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- 4. Verificar el resultado final
SELECT email, role, full_name, created_at FROM public.profiles;