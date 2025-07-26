-- Corrección crítica de seguridad: funciones sin search_path seguro
-- WARN 4-19: Function Search Path Mutable - Agregar SET search_path para las funciones de pgtap restantes

-- Función 1: _pg_sv_column_array
CREATE OR REPLACE FUNCTION public._pg_sv_column_array(oid, smallint[])
RETURNS name[]
LANGUAGE sql
STABLE
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT ARRAY(
        SELECT a.attname
          FROM pg_catalog.pg_attribute a
          JOIN generate_series(1, array_upper($2, 1)) s(i) ON a.attnum = $2[i]
         WHERE attrelid = $1
         ORDER BY i
    )
$function$;

-- Función 2: has_group
CREATE OR REPLACE FUNCTION public.has_group(name)
RETURNS text
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT ok( _has_group($1), 'Group ' || quote_ident($1) || ' should exist' );
$function$;

-- Función 3: _keys
CREATE OR REPLACE FUNCTION public._keys(name, name, character)
RETURNS SETOF name[]
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT _pg_sv_column_array(x.conrelid,x.conkey) -- name[] doesn't support collation
      FROM pg_catalog.pg_namespace n
      JOIN pg_catalog.pg_class c       ON n.oid = c.relnamespace
      JOIN pg_catalog.pg_constraint x  ON c.oid = x.conrelid
     WHERE n.nspname = $1
       AND c.relname = $2
       AND x.contype = $3
  ORDER BY 1
$function$;

-- Función 4: col_has_check
CREATE OR REPLACE FUNCTION public.col_has_check(name, name)
RETURNS text
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT col_has_check( $1, $2, 'Column ' || quote_ident($1) || '(' || quote_ident($2) || ') should have a check constraint' );
$function$;

-- Función 5: has_unique
CREATE OR REPLACE FUNCTION public.has_unique(text)
RETURNS text
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT has_unique( $1, 'Table ' || quote_ident($1) || ' should have a unique constraint' );
$function$;

-- Función 6: _pg_sv_table_accessible
CREATE OR REPLACE FUNCTION public._pg_sv_table_accessible(oid, oid)
RETURNS boolean
LANGUAGE sql
IMMUTABLE STRICT
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT CASE WHEN has_schema_privilege($1, 'USAGE') THEN (
                  has_table_privilege($2, 'SELECT')
               OR has_table_privilege($2, 'INSERT')
               or has_table_privilege($2, 'UPDATE')
               OR has_table_privilege($2, 'DELETE')
               OR has_table_privilege($2, 'RULE')
               OR has_table_privilege($2, 'REFERENCES')
               OR has_table_privilege($2, 'TRIGGER')
           ) ELSE FALSE
    END;
$function$;

-- Función 7: _time_trials
CREATE OR REPLACE FUNCTION public._time_trials(text, integer, numeric)
RETURNS SETOF _time_trial_type
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
    query            TEXT := _query($1);
    iterations       ALIAS FOR $2;
    return_percent   ALIAS FOR $3;
    start_time       TEXT;
    act_time         NUMERIC;
    times            NUMERIC[];
    offset_it        INT;
    limit_it         INT;
    offset_percent   NUMERIC;
    a_time	     _time_trial_type;
BEGIN
    -- Execute the query over and over
    FOR i IN 1..iterations LOOP
        start_time := timeofday();
        EXECUTE query;
        -- Store the execution time for the run in an array of times
        times[i] := extract(millisecond from timeofday()::timestamptz - start_time::timestamptz);
    END LOOP;
    offset_percent := (1.0 - return_percent) / 2.0;
    -- Ensure that offset skips the bottom X% of runs, or set it to 0
    SELECT GREATEST((offset_percent * iterations)::int, 0) INTO offset_it;
    -- Ensure that with limit the query to returning only the middle X% of runs
    SELECT GREATEST((return_percent * iterations)::int, 1) INTO limit_it;

    FOR a_time IN SELECT times[i]
		  FROM generate_series(array_lower(times, 1), array_upper(times, 1)) i
                  ORDER BY 1
                  OFFSET offset_it
                  LIMIT limit_it LOOP
	RETURN NEXT a_time;
    END LOOP;
END;
$function$;

-- Función 8: _relexists (name, name)
CREATE OR REPLACE FUNCTION public._relexists(name, name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT EXISTS(
        SELECT true
          FROM pg_catalog.pg_namespace n
          JOIN pg_catalog.pg_class c ON n.oid = c.relnamespace
         WHERE n.nspname = $1
           AND c.relname = $2
    );
$function$;

-- Función 9: _relexists (name)
CREATE OR REPLACE FUNCTION public._relexists(name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT EXISTS(
        SELECT true
          FROM pg_catalog.pg_class c
         WHERE pg_catalog.pg_table_is_visible(c.oid)
           AND c.relname = $1
    );
$function$;

-- Función 10: _rexists (character[], name, name)
CREATE OR REPLACE FUNCTION public._rexists(character[], name, name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT EXISTS(
        SELECT true
          FROM pg_catalog.pg_namespace n
          JOIN pg_catalog.pg_class c ON n.oid = c.relnamespace
         WHERE c.relkind = ANY($1)
           AND n.nspname = $2
           AND c.relname = $3
    );
$function$;

-- Función 11: _rexists (character[], name)
CREATE OR REPLACE FUNCTION public._rexists(character[], name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT EXISTS(
        SELECT true
          FROM pg_catalog.pg_class c
         WHERE c.relkind = ANY($1)
           AND pg_catalog.pg_table_is_visible(c.oid)
           AND c.relname = $2
    );
$function$;

-- Función 12: _rexists (character, name, name)
CREATE OR REPLACE FUNCTION public._rexists(character, name, name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT _rexists(ARRAY[$1], $2, $3);
$function$;

-- Función 13: _rexists (character, name)
CREATE OR REPLACE FUNCTION public._rexists(character, name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
SELECT _rexists(ARRAY[$1], $2);
$function$;

-- Función 14: _cexists (name, name, name)
CREATE OR REPLACE FUNCTION public._cexists(name, name, name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT EXISTS(
        SELECT true
          FROM pg_catalog.pg_namespace n
          JOIN pg_catalog.pg_class c ON n.oid = c.relnamespace
          JOIN pg_catalog.pg_attribute a ON c.oid = a.attrelid
         WHERE n.nspname = $1
           AND c.relname = $2
           AND a.attnum > 0
           AND NOT a.attisdropped
           AND a.attname = $3
    );
$function$;

-- Función 15: _cexists (name, name)
CREATE OR REPLACE FUNCTION public._cexists(name, name)
RETURNS boolean
LANGUAGE sql
SET search_path = 'public', 'pg_temp'
AS $function$
    SELECT EXISTS(
        SELECT true
          FROM pg_catalog.pg_class c
          JOIN pg_catalog.pg_attribute a ON c.oid = a.attrelid
         WHERE c.relname = $1
           AND pg_catalog.pg_table_is_visible(c.oid)
           AND a.attnum > 0
           AND NOT a.attisdropped
           AND a.attname = $2
    );
$function$;