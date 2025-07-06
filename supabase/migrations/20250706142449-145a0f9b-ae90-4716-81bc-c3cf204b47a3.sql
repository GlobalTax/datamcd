-- Limpiar sistema de Companies - Eliminar todas las tablas relacionadas

-- Eliminar tablas en orden correcto para evitar errores de foreign key
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.einforma_data CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Eliminar el enum de roles de la aplicación si existe
DROP TYPE IF EXISTS public.app_role CASCADE;