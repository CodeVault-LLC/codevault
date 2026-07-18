-- Postgres marks array_to_string() STABLE, not IMMUTABLE, because in general it
-- depends on the element type's output function. A stored generated column may
-- only call IMMUTABLE functions, so using it directly in the reports
-- search_vector expression fails with "generation expression is not immutable".
--
-- For text[] specifically the operation genuinely is immutable, so wrap it and
-- say so. This must exist before the reports table that depends on it.
CREATE OR REPLACE FUNCTION immutable_array_to_string(arr text[], sep text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT array_to_string(coalesce(arr, '{}'::text[]), sep)
$$;
