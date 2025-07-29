-- Agregar nuevos campos a la tabla restaurant_incidents para coincidir con el Excel
ALTER TABLE public.restaurant_incidents 
ADD COLUMN IF NOT EXISTS nombre text,
ADD COLUMN IF NOT EXISTS naves text,
ADD COLUMN IF NOT EXISTS ingeniero text,
ADD COLUMN IF NOT EXISTS clasificacion text,
ADD COLUMN IF NOT EXISTS participante text,
ADD COLUMN IF NOT EXISTS periodo text,
ADD COLUMN IF NOT EXISTS importe_carto numeric,
ADD COLUMN IF NOT EXISTS documento_url text,
ADD COLUMN IF NOT EXISTS fecha_cierre date,
ADD COLUMN IF NOT EXISTS comentarios_cierre text;

-- Actualizar el tipo incident_type para incluir las clasificaciones del Excel
ALTER TABLE public.restaurant_incidents 
ALTER COLUMN incident_type TYPE text;

-- Comentario: Los nuevos campos añadidos son:
-- nombre: Nombre específico del incidente
-- naves: Referencia a naves/ubicaciones específicas
-- ingeniero: Ingeniero asignado al incidente
-- clasificacion: Clasificación detallada del tipo de incidente
-- participante: Persona/empresa participante en la resolución
-- periodo: Periodo de tiempo relacionado
-- importe_carto: Importe económico asociado
-- documento_url: URL del documento relacionado
-- fecha_cierre: Fecha de cierre específica
-- comentarios_cierre: Comentarios adicionales al cerrar