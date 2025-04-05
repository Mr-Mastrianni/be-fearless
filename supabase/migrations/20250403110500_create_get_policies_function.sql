-- Function to query RLS policies for a specific table
-- Rename this file with a proper timestamp before applying migrations!
CREATE OR REPLACE FUNCTION get_rls_policies(schema_name_param text, table_name_param text)
RETURNS TABLE (
  policyname name,
  schemaname name,
  tablename name,
  cmd text,
  qual text,
  with_check text
)
LANGUAGE sql
SECURITY DEFINER -- Allows querying pg_catalog even if the calling role normally couldn't
AS $$
  SELECT
    p.policyname,
    p.schemaname,
    p.tablename,
    p.cmd::text, -- Cast command type to text
    p.qual,
    p.with_check
  FROM
    pg_catalog.pg_policies p
  WHERE
    p.schemaname = schema_name_param AND p.tablename = table_name_param;
$$;

-- Grant execute permission to the authenticated role
-- The MCP server uses the anon key, but policies often depend on the authenticated user.
-- If you need anon users to be able to call this (unlikely for fetching policies), grant to 'anon' as well.
GRANT EXECUTE ON FUNCTION get_rls_policies(text, text) TO authenticated;