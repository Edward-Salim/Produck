CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.produck_pbkdf2_sha512(
  password_key bytea,
  salt bytea,
  rounds integer
) RETURNS bit(512)
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog
AS $$
DECLARE
  block bytea := public.hmac(salt || int4send(1), password_key, 'sha512');
  result bit(512) := ('x' || encode(block, 'hex'))::bit(512);
BEGIN
  IF rounds NOT BETWEEN 1 AND 1000000 THEN
    RAISE EXCEPTION 'Invalid PBKDF2 iteration count';
  END IF;

  -- The existing 64-byte derived key occupies one SHA-512 output block (RFC 8018).
  FOR i IN 2..rounds LOOP
    block := public.hmac(block, password_key, 'sha512');
    result := result # ('x' || encode(block, 'hex'))::bit(512);
  END LOOP;
  RETURN result;
END;
$$;
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION public.produck_pbkdf2_sha512(bytea, bytea, integer) FROM PUBLIC;
