-- 1) Ensure extensions schema exists
create schema if not exists extensions;

-- 2) Move extensions currently installed in public to extensions schema
alter extension pgtap set schema extensions;
alter extension http set schema extensions;

-- 3) Add SET search_path to functions missing it for safe, predictable resolution

-- add_incident_comment_to_history
create or replace function public.add_incident_comment_to_history()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
BEGIN
  -- Si se actualiza comentarios_cierre, agregar al historial
  IF OLD.comentarios_cierre IS DISTINCT FROM NEW.comentarios_cierre AND NEW.comentarios_cierre IS NOT NULL THEN
    NEW.comentarios_historial = COALESCE(NEW.comentarios_historial, '[]'::jsonb) || 
      jsonb_build_object(
        'fecha', now(),
        'comentario', NEW.comentarios_cierre,
        'usuario_id', auth.uid()
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- update_company_data_updated_at
create or replace function public.update_company_data_updated_at()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
