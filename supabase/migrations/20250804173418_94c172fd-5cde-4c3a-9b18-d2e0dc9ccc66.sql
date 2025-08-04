-- Limpiar registro de franquiciado del superadmin
DELETE FROM public.franchisees 
WHERE user_id = '62bdec15-90ae-4339-8416-39c847aee996' 
  AND franchisee_name = 'Nuevo Franquiciado';