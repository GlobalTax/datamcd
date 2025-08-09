create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;