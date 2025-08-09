alter view public.restaurant set (security_invoker = true);
alter view public.restaurant_access_view set (security_invoker = true);