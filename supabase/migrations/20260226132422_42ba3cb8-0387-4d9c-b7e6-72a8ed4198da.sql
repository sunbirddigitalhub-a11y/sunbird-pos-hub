
-- Z-Reports table for daily closing records
CREATE TABLE public.z_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  total_sales BIGINT NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  cash_sales BIGINT NOT NULL DEFAULT 0,
  cash_transactions INTEGER NOT NULL DEFAULT 0,
  mobile_money_sales BIGINT NOT NULL DEFAULT 0,
  mobile_money_transactions INTEGER NOT NULL DEFAULT 0,
  bank_sales BIGINT NOT NULL DEFAULT 0,
  bank_transactions INTEGER NOT NULL DEFAULT 0,
  split_sales BIGINT NOT NULL DEFAULT 0,
  split_transactions INTEGER NOT NULL DEFAULT 0,
  physical_cash BIGINT,
  cash_difference BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open',
  closed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can view z_reports" ON public.z_reports FOR SELECT USING (true);
CREATE POLICY "Anon can insert z_reports" ON public.z_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can update z_reports" ON public.z_reports FOR UPDATE USING (true);
CREATE POLICY "Authenticated can view z_reports" ON public.z_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert z_reports" ON public.z_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update z_reports" ON public.z_reports FOR UPDATE USING (true);
