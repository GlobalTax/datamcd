-- Fix infinite recursion in restaurant_members policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "restaurant_members_select_policy" ON restaurant_members;
DROP POLICY IF EXISTS "restaurant_members_insert_policy" ON restaurant_members;
DROP POLICY IF EXISTS "restaurant_members_update_policy" ON restaurant_members;
DROP POLICY IF EXISTS "restaurant_members_delete_policy" ON restaurant_members;

-- Create simple, non-recursive policies for restaurant_members
CREATE POLICY "restaurant_members_select_policy" 
ON restaurant_members FOR SELECT 
USING (
  -- Allow users to see their own memberships
  auth.uid() = user_id
  OR 
  -- Allow admins to see all
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
  OR
  -- Allow restaurant owners/managers to see members of their restaurants
  EXISTS (
    SELECT 1 FROM restaurant_members rm2
    WHERE rm2.restaurant_id = restaurant_members.restaurant_id
    AND rm2.user_id = auth.uid()
    AND rm2.role IN ('owner', 'manager')
    AND rm2.is_active = true
  )
);

CREATE POLICY "restaurant_members_insert_policy"
ON restaurant_members FOR INSERT
WITH CHECK (
  -- Only admins or restaurant owners can add members
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
  OR
  EXISTS (
    SELECT 1 FROM restaurant_members rm
    WHERE rm.restaurant_id = restaurant_members.restaurant_id
    AND rm.user_id = auth.uid()
    AND rm.role = 'owner'
    AND rm.is_active = true
  )
);

CREATE POLICY "restaurant_members_update_policy"
ON restaurant_members FOR UPDATE
USING (
  -- Same conditions as select for simplicity
  auth.uid() = user_id
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
  OR
  EXISTS (
    SELECT 1 FROM restaurant_members rm2
    WHERE rm2.restaurant_id = restaurant_members.restaurant_id
    AND rm2.user_id = auth.uid()
    AND rm2.role IN ('owner', 'manager')
    AND rm2.is_active = true
  )
);

CREATE POLICY "restaurant_members_delete_policy"
ON restaurant_members FOR DELETE
USING (
  -- Only admins or restaurant owners can delete members
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
  OR
  EXISTS (
    SELECT 1 FROM restaurant_members rm
    WHERE rm.restaurant_id = restaurant_members.restaurant_id
    AND rm.user_id = auth.uid()
    AND rm.role = 'owner'
    AND rm.is_active = true
  )
);