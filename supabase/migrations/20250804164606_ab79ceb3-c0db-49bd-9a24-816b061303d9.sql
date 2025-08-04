-- Actualizar las incidencias existentes con datos más realistas
UPDATE public.incidents 
SET 
  participante = CASE id
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'ClimaTech Solutions'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Instalaciones Gómez S.L.'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'ElectroServicios Madrid'
    ELSE participante
  END,
  ingeniero = CASE id
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Juan Carlos Martín'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Ana López García'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Roberto Sánchez'
    ELSE ingeniero
  END,
  clasificacion = CASE id
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'HVAC'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Preventivo' 
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Urgente'
    ELSE clasificacion
  END,
  periodo = '2024-01',
  importe_carto = CASE id
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 0) THEN 2450.00
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 1) THEN 875.50
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 2) THEN 1290.75
    ELSE importe_carto
  END,
  numero_pedido = CASE id
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'PED-2024-0156'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'PED-2024-0187'
    WHEN (SELECT id FROM public.incidents ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'PED-2024-0298'
    ELSE numero_pedido
  END,
  fecha_cierre = CASE status
    WHEN 'closed' THEN now() - interval '3 days'
    WHEN 'resolved' THEN now() - interval '1 day'
    ELSE NULL
  END,
  comentarios_cierre = CASE status
    WHEN 'closed' THEN 'Reparación completada. Sistema funcionando correctamente. Se recomienda revisión en 6 meses.'
    WHEN 'resolved' THEN 'Trabajo realizado según protocolo. Equipos operativos.'
    ELSE NULL
  END;