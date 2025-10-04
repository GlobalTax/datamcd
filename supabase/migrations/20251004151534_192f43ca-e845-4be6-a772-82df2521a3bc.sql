-- Add missing unique constraints and fix s.navarro@obn.es access

-- Step 1: Add unique constraint on franchisees.user_id (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'franchisees_user_id_key' AND conrelid = 'public.franchisees'::regclass
  ) THEN
    -- Remove duplicates first if any
    DELETE FROM public.franchisees f1
    WHERE f1.ctid NOT IN (
      SELECT MIN(f2.ctid)
      FROM public.franchisees f2
      WHERE f2.user_id = f1.user_id
    );
    
    ALTER TABLE public.franchisees 
      ADD CONSTRAINT franchisees_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Step 2: Add unique constraint on user_roles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key' AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles 
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Step 3: Data fix for s.navarro@obn.es
DO $$
DECLARE
  v_email text := 's.navarro@obn.es';
  v_user_id uuid;
  v_franchisee_id uuid;
  v_franchisee_name text;
  v_inserted_count int := 0;
BEGIN
  SELECT id INTO v_user_id FROM public.profiles WHERE email = v_email LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found', v_email;
  END IF;

  v_franchisee_name := COALESCE((SELECT full_name FROM public.profiles WHERE id = v_user_id), split_part(v_email,'@',1)) || ' Franquicias';

  -- Upsert franchisee
  INSERT INTO public.franchisees (franchisee_name, user_id, country)
  VALUES (v_franchisee_name, v_user_id, 'España')
  ON CONFLICT (user_id) DO UPDATE SET
    franchisee_name = COALESCE(franchisees.franchisee_name, EXCLUDED.franchisee_name),
    updated_at = now()
  RETURNING id INTO v_franchisee_id;

  IF v_franchisee_id IS NULL THEN
    SELECT id INTO v_franchisee_id FROM public.franchisees WHERE user_id = v_user_id;
  END IF;

  -- Assign role
  INSERT INTO public.user_roles (user_id, role, franchisee_id, is_active)
  VALUES (v_user_id, 'franquiciado', v_franchisee_id, true)
  ON CONFLICT (user_id, role) DO UPDATE SET
    franchisee_id = EXCLUDED.franchisee_id,
    is_active = true;

  -- Link restaurants
  INSERT INTO public.franchisee_restaurants (franchisee_id, base_restaurant_id, status, assigned_at)
  SELECT v_franchisee_id, br.id, 'active', now()
  FROM public.base_restaurants br
  WHERE br.franchisee_email = v_email
    AND NOT EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      WHERE fr.base_restaurant_id = br.id AND fr.franchisee_id = v_franchisee_id
    );

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- Update count
  UPDATE public.franchisees
  SET total_restaurants = (
    SELECT COUNT(*) FROM public.franchisee_restaurants fr
    WHERE fr.franchisee_id = v_franchisee_id AND fr.status = 'active'
  ),
  updated_at = now()
  WHERE id = v_franchisee_id;

  RAISE NOTICE 'Linked % restaurants for %', v_inserted_count, v_email;
END $$;