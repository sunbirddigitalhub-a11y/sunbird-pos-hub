
-- Create expenses table for daily expense tracking
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  amount bigint NOT NULL DEFAULT 0,
  description text,
  staff_member text,
  staff_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (true);

-- Add unique constraint on z_reports report_date for upsert
ALTER TABLE public.z_reports ADD CONSTRAINT z_reports_report_date_unique UNIQUE (report_date);
