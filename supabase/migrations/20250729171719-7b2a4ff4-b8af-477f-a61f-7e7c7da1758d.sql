-- Security Fix Phase 1: Critical Database Security (Fixed for correct table structure)

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

-- 3. Add RLS policies for providers table (using created_by, not franchisee_id)
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage providers they created" ON public.providers
FOR ALL TO authenticated
USING (created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
WITH CHECK (created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

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

CREATE POLICY "Admins can insert report snapshots" ON public.report_snapshots
FOR INSERT TO authenticated
WITH CHECK (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Admins can update report snapshots" ON public.report_snapshots
FOR UPDATE TO authenticated
USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
WITH CHECK (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Admins can delete report snapshots" ON public.report_snapshots
FOR DELETE TO authenticated
USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

-- 9. Add server-side role validation function
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

-- 10. Add user deletion validation function
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