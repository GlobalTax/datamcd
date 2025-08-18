import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Client for general operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for privileged operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'franchisee' | 'staff' | 'superadmin';
  existingFranchiseeId?: string;
  restaurantId?: string;
}

interface DeleteUserRequest {
  userId: string;
  franchiseeId?: string;
  restaurantId?: string;
  reason?: string;
}

async function validateUserRole(authHeader: string): Promise<{ userId: string; role: string } | null> {
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth validation error:', error);
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return null;
    }

    return { userId: user.id, role: profile.role };
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

async function createUser(request: CreateUserRequest, requesterId: string): Promise<Response> {
  const { email, password, fullName, role, existingFranchiseeId, restaurantId } = request;

  console.log('Creating user:', { email, fullName, role, existingFranchiseeId, restaurantId, requesterId });

  try {
    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (fullName.length < 2 || fullName.length > 100) {
      return new Response(JSON.stringify({ error: 'Nombre debe tener entre 2 y 100 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 8 || password.length > 128) {
      return new Response(JSON.stringify({ error: 'Contraseña debe tener entre 8 y 128 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'Ya existe un usuario con este email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create user using admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName.trim(),
        role: role
      }
    });

    if (createError || !userData.user) {
      console.error('Error creating user:', createError);
      return new Response(JSON.stringify({ error: `Error al crear usuario: ${createError?.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User created successfully:', userData.user.id);

    // Create/update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email: email.toLowerCase(),
        full_name: fullName.trim(),
        role: role
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Try to clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return new Response(JSON.stringify({ error: 'Error al crear perfil de usuario' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle role-specific assignments
    if (role === 'franchisee') {
      if (existingFranchiseeId) {
        // Link to existing franchisee
        const { error: updateError } = await supabase
          .from('franchisees')
          .update({ user_id: userData.user.id })
          .eq('id', existingFranchiseeId);

        if (updateError) {
          console.error('Error linking to existing franchisee:', updateError);
          return new Response(JSON.stringify({ error: 'Error al vincular con franquiciado existente' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else {
        // Create new franchisee
        const { error: franchiseeError } = await supabase
          .from('franchisees')
          .insert({
            user_id: userData.user.id,
            franchisee_name: fullName.trim()
          });

        if (franchiseeError) {
          console.error('Error creating franchisee:', franchiseeError);
          return new Response(JSON.stringify({ error: 'Error al crear franquiciado' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    if (role === 'staff') {
      // If franchiseeId provided, add to franchisee_staff
      if (existingFranchiseeId) {
        const { error: staffError } = await supabase
          .from('franchisee_staff')
          .insert({
            user_id: userData.user.id,
            franchisee_id: existingFranchiseeId,
            position: 'Empleado'
          });

        if (staffError) {
          console.error('Error creating staff assignment:', staffError);
          return new Response(JSON.stringify({ error: 'Error al asignar como staff' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // If restaurantId provided, add to restaurant_members  
      if (restaurantId) {
        const { error: memberError } = await supabase
          .from('restaurant_members')
          .insert({
            user_id: userData.user.id,
            restaurant_id: restaurantId,
            role: 'staff',
            assigned_by: requesterId,
            permissions: {}
          });

        if (memberError) {
          console.error('Error creating restaurant member:', memberError);
          return new Response(JSON.stringify({ error: 'Error al asignar al restaurante' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: requesterId,
        action_type: 'USER_CREATED',
        table_name: 'profiles',
        record_id: userData.user.id,
        new_values: {
          email: email.toLowerCase(),
          full_name: fullName.trim(),
          role: role,
          created_by: requesterId,
          existing_franchisee_id: existingFranchiseeId,
          restaurant_id: restaurantId
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: userData.user.id,
        email: email.toLowerCase(),
        full_name: fullName.trim(),
        role: role
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in createUser:', error);
    return new Response(JSON.stringify({ error: 'Error inesperado al crear usuario' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function deleteUser(request: DeleteUserRequest, requesterId: string): Promise<Response> {
  const { userId, franchiseeId, restaurantId, reason } = request;

  console.log('Deleting user:', { userId, franchiseeId, restaurantId, reason, requesterId });

  try {
    // Validate deletion permissions using existing RPC
    const { data: canDelete, error: validationError } = await supabase
      .rpc('validate_user_deletion', {
        target_user_id: userId,
        deleter_user_id: requesterId
      });

    if (validationError) {
      console.error('Error validating user deletion:', validationError);
      return new Response(JSON.stringify({ error: 'Error al validar permisos de eliminación' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!canDelete) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para eliminar este usuario' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user data for audit
    const { data: userData } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', userId)
      .single();

    // 1. Unlink from franchisees
    if (franchiseeId) {
      const { error: franchiseeError } = await supabase
        .from('franchisees')
        .update({ user_id: null })
        .eq('id', franchiseeId)
        .eq('user_id', userId);

      if (franchiseeError) {
        console.error('Error unlinking franchisee:', franchiseeError);
        return new Response(JSON.stringify({ error: 'Error al desvincular franquiciado' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. Deactivate all restaurant memberships
    const { error: membershipError } = await supabase
      .from('restaurant_members')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error deactivating memberships:', membershipError);
    }

    // 3. Expire invitations
    if (franchiseeId) {
      const { error: invitationError } = await supabase
        .from('franchisee_invitations')
        .update({ status: 'expired' })
        .eq('franchisee_id', franchiseeId);

      if (invitationError) {
        console.error('Error expiring invitations:', invitationError);
      }
    }

    // 4. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return new Response(JSON.stringify({ error: 'Error al eliminar perfil' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Delete from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting from auth:', authError);
      // Profile is already deleted, but auth user remains - not critical
    }

    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: requesterId,
        action_type: 'USER_DELETED',
        table_name: 'profiles',
        record_id: userId,
        old_values: {
          ...userData,
          deleted_by: requesterId,
          reason: reason,
          franchisee_id: franchiseeId,
          restaurant_id: restaurantId
        }
      });

    return new Response(JSON.stringify({ 
      success: true,
      message: `Usuario ${userData?.full_name || userData?.email} eliminado exitosamente`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in deleteUser:', error);
    return new Response(JSON.stringify({ error: 'Error inesperado al eliminar usuario' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header requerido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userInfo = await validateUserRole(authHeader);
    if (!userInfo) {
      return new Response(JSON.stringify({ error: 'Token de autenticación inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check admin permissions
    if (!['admin', 'superadmin'].includes(userInfo.role)) {
      return new Response(JSON.stringify({ error: 'Permisos insuficientes' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    
    if (req.method === 'POST' && url.pathname.endsWith('/create')) {
      const body = await req.json();
      return await createUser(body, userInfo.userId);
    }
    
    if (req.method === 'POST' && url.pathname.endsWith('/delete')) {
      const body = await req.json();
      return await deleteUser(body, userInfo.userId);
    }

    return new Response(JSON.stringify({ error: 'Endpoint no encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Global error handler:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});