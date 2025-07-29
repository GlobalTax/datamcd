-- Security Fix Phase 2: Fix remaining function search path issues

-- Fix the remaining functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.col_has_check(name, name)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    SELECT col_has_check( $1, $2, 'Column ' || quote_ident($1) || '(' || quote_ident($2) || ') should have a check constraint' );
$function$;

CREATE OR REPLACE FUNCTION public.has_unique(text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    SELECT has_unique( $1, 'Table ' || quote_ident($1) || ' should have a unique constraint' );
$function$;

CREATE OR REPLACE FUNCTION public.hasnt_pk(name)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    SELECT hasnt_pk( $1, 'Table ' || quote_ident($1) || ' should not have a primary key' );
$function$;

CREATE OR REPLACE FUNCTION public.has_group(name)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    SELECT ok( _has_group($1), 'Group ' || quote_ident($1) || ' should exist' );
$function$;

CREATE OR REPLACE FUNCTION public.set_ne(text, text, text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    SELECT _relne( $1, $2, $3, '' );
$function$;