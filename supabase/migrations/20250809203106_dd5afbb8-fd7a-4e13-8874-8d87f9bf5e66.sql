-- Create dedicated extensions schema if not exists
create schema if not exists extensions;

-- Recreate http extension under extensions schema
-- Warning: this drops and recreates only the extension-provided objects
-- using CASCADE ensures all extension-owned objects are dropped first
DROP EXTENSION IF EXISTS http CASCADE;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Verify: comment for audit
comment on extension http is 'Installed in extensions schema to satisfy security linter (avoid public).';