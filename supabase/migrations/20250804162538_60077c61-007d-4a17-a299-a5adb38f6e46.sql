-- Agregar campos faltantes a la tabla incidents
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS numero_secuencial integer,
ADD COLUMN IF NOT EXISTS numero_pedido text,
ADD COLUMN IF NOT EXISTS comentarios_historial jsonb DEFAULT '[]'::jsonb;

-- Crear secuencia para número secuencial auto-incremental
CREATE SEQUENCE IF NOT EXISTS incidents_numero_secuencial_seq;

-- Actualizar registros existentes con números secuenciales
UPDATE public.incidents 
SET numero_secuencial = nextval('incidents_numero_secuencial_seq')
WHERE numero_secuencial IS NULL;

-- Establecer el valor por defecto para nuevos registros
ALTER TABLE public.incidents 
ALTER COLUMN numero_secuencial SET DEFAULT nextval('incidents_numero_secuencial_seq');

-- Función para agregar comentarios al historial
CREATE OR REPLACE FUNCTION add_incident_comment_to_history()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Crear trigger para el historial de comentarios
DROP TRIGGER IF EXISTS incidents_comment_history_trigger ON public.incidents;
CREATE TRIGGER incidents_comment_history_trigger
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION add_incident_comment_to_history();