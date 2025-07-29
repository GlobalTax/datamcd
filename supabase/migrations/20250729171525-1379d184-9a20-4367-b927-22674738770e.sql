-- Security Fix Phase 1: Critical Database Security

-- 1. Create security definer function for role validation
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 2. Helper function for staff membership check
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_uuid uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_id = franchisee_uuid
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 3. Add missing RLS policies for providers table
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Franchisees can manage their providers" ON public.providers
FOR ALL TO authenticated
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- 4. Add RLS policies for voice_notes table
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their voice notes" ON public.voice_notes
FOR ALL TO authenticated
USING (user_id = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
WITH CHECK (user_id = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

-- 5. Add RLS policies for voice_transcripts table
ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage transcripts for their voice notes" ON public.voice_transcripts
FOR ALL TO authenticated
USING (
  voice_note_id IN (
    SELECT id FROM voice_notes WHERE user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  voice_note_id IN (
    SELECT id FROM voice_notes WHERE user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- 6. Add RLS policies for voice_entity_links table
ALTER TABLE public.voice_entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage entity links for their voice notes" ON public.voice_entity_links
FOR ALL TO authenticated
USING (
  voice_note_id IN (
    SELECT id FROM voice_notes WHERE user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  voice_note_id IN (
    SELECT id FROM voice_notes WHERE user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- 7. Add RLS policies for report_definitions table
ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage report definitions" ON public.report_definitions
FOR ALL TO authenticated
USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
WITH CHECK (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Users can view active report definitions" ON public.report_definitions
FOR SELECT TO authenticated
USING (is_active = true);

-- 8. Add RLS policies for report_snapshots table
ALTER TABLE public.report_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view report snapshots for accessible restaurants" ON public.report_snapshots
FOR SELECT TO authenticated
USING (
  restaurant_id IN (
    SELECT fr.base_restaurant_id FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Admins can manage report snapshots" ON public.report_snapshots
FOR INSERT, UPDATE, DELETE TO authenticated
USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
WITH CHECK (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

-- 9. Fix existing database functions security
CREATE OR REPLACE FUNCTION public.ensure_single_primary_biloop_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Si se marca como primaria, desmarcar las demás del mismo franquiciado
  IF NEW.is_primary = true THEN
    UPDATE public.franchisee_biloop_companies 
    SET is_primary = false 
    WHERE franchisee_id = NEW.franchisee_id 
      AND id != NEW.id;
  END IF;
  
  -- Si no hay ninguna primaria, hacer ésta la primaria
  IF NOT EXISTS (
    SELECT 1 FROM public.franchisee_biloop_companies 
    WHERE franchisee_id = NEW.franchisee_id 
      AND is_primary = true 
      AND id != NEW.id
  ) THEN
    NEW.is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_vacation_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Calcular días de vacaciones pendientes basado en días del año y días usados
  NEW.vacation_days_pending = NEW.vacation_days_per_year - NEW.vacation_days_used;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_franchisee_profile(user_id uuid, user_email text, user_full_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Insertar el perfil en la tabla profiles, manejando conflictos
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  ) VALUES (
    user_id,
    user_email,
    user_full_name,
    'franchisee'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error in create_franchisee_profile: %', SQLERRM;
      RAISE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_assign_restaurants_to_franchisee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Insertar automáticamente en franchisee_restaurants todos los restaurantes
  -- que tengan el mismo nombre de franquiciado
  INSERT INTO public.franchisee_restaurants (
    franchisee_id,
    base_restaurant_id,
    status,
    assigned_at
  )
  SELECT 
    NEW.id,
    br.id,
    'active',
    now()
  FROM public.base_restaurants br
  WHERE br.franchisee_name = NEW.franchisee_name
  AND NOT EXISTS (
    -- Evitar duplicados si ya existe la asignación
    SELECT 1 FROM public.franchisee_restaurants fr
    WHERE fr.franchisee_id = NEW.id AND fr.base_restaurant_id = br.id
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.manually_assign_restaurants_to_existing_franchisees()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  franchisee_record RECORD;
BEGIN
  -- Para cada franquiciado existente, vincular sus restaurantes
  FOR franchisee_record IN 
    SELECT id, franchisee_name FROM public.franchisees
  LOOP
    INSERT INTO public.franchisee_restaurants (
      franchisee_id,
      base_restaurant_id,
      status,
      assigned_at
    )
    SELECT 
      franchisee_record.id,
      br.id,
      'active',
      now()
    FROM public.base_restaurants br
    WHERE br.franchisee_name = franchisee_record.franchisee_name
    AND NOT EXISTS (
      -- Evitar duplicados
      SELECT 1 FROM public.franchisee_restaurants fr
      WHERE fr.franchisee_id = franchisee_record.id AND fr.base_restaurant_id = br.id
    );
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_franchisee_last_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Actualizar el logout_time de la sesión anterior si existe
  UPDATE public.franchisee_access_log 
  SET logout_time = now(),
      session_duration = EXTRACT(EPOCH FROM (now() - login_time)) / 60
  WHERE user_id = NEW.user_id 
    AND logout_time IS NULL 
    AND id != NEW.id;
  
  RETURN NEW;
END;
$function$;

-- 10. Add server-side role validation function
CREATE OR REPLACE FUNCTION public.validate_user_role_assignment(target_role text, assigner_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Role hierarchy validation
  CASE assigner_role
    WHEN 'superadmin' THEN
      -- Superadmin can assign any role
      RETURN true;
    WHEN 'admin' THEN
      -- Admin cannot create superadmin
      RETURN target_role != 'superadmin';
    ELSE
      -- Other roles cannot assign roles
      RETURN false;
  END CASE;
END;
$function$;

-- 11. Add user deletion validation function
CREATE OR REPLACE FUNCTION public.validate_user_deletion(target_user_id uuid, deleter_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  deleter_role text;
  target_role text;
BEGIN
  -- Get roles
  SELECT role INTO deleter_role FROM profiles WHERE id = deleter_user_id;
  SELECT role INTO target_role FROM profiles WHERE id = target_user_id;
  
  -- Cannot delete yourself
  IF target_user_id = deleter_user_id THEN
    RETURN false;
  END IF;
  
  -- Role hierarchy for deletion
  CASE deleter_role
    WHEN 'superadmin' THEN
      -- Superadmin can delete anyone except other superadmins
      RETURN target_role != 'superadmin';
    WHEN 'admin' THEN
      -- Admin can delete franchisee and staff only
      RETURN target_role IN ('franchisee', 'staff');
    ELSE
      -- Other roles cannot delete users
      RETURN false;
  END CASE;
END;
$function$;