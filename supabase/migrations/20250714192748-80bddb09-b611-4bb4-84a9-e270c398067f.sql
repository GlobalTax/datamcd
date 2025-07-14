-- Plan de implementación: Paso 1 - Asignar datos existentes de Orquest a franquiciados
-- Asignar servicios de Orquest sin franquiciado al primer franquiciado disponible

DO $$
DECLARE
    first_franchisee_id uuid;
BEGIN
    -- Obtener el primer franquiciado disponible
    SELECT id INTO first_franchisee_id 
    FROM public.franchisees 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Si existe al menos un franquiciado, asignar los servicios
    IF first_franchisee_id IS NOT NULL THEN
        -- Actualizar servicios sin franquiciado asignado
        UPDATE public.servicios_orquest 
        SET franchisee_id = first_franchisee_id,
            updated_at = now()
        WHERE franchisee_id IS NULL;
        
        -- Actualizar empleados de Orquest sin franquiciado asignado
        UPDATE public.orquest_employees 
        SET franchisee_id = first_franchisee_id,
            updated_at = now()
        WHERE franchisee_id IS NULL;
        
        RAISE NOTICE 'Asignados servicios y empleados de Orquest al franquiciado: %', first_franchisee_id;
    ELSE
        RAISE NOTICE 'No se encontraron franquiciados disponibles para asignar datos de Orquest';
    END IF;
END $$;