-- Create payment_history table to track individual payments on outstanding invoices
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  staff_name TEXT,
  staff_user_id UUID,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view payment_history"
ON public.payment_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payment_history"
ON public.payment_history FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for payment_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_history;

-- Create payment-receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', true);

-- Storage policies for payment-receipts bucket
CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Anyone can view payment receipts"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'payment-receipts');