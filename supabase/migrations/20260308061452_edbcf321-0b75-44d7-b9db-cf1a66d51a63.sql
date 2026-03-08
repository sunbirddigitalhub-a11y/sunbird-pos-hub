ALTER TABLE public.z_reports ADD COLUMN IF NOT EXISTS report_snapshot jsonb DEFAULT NULL;
ALTER TABLE public.z_reports ADD COLUMN IF NOT EXISTS closed_by uuid DEFAULT NULL;
ALTER TABLE public.z_reports ADD COLUMN IF NOT EXISTS closed_by_name text DEFAULT NULL;
ALTER TABLE public.z_reports ADD COLUMN IF NOT EXISTS closed_by_role text DEFAULT NULL;