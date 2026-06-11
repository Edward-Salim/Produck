ALTER TABLE "app_user" ADD COLUMN "preferences" jsonb DEFAULT '{"music":true,"sounds":true}'::jsonb;
