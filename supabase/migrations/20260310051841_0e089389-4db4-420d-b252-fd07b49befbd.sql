
-- Fix 1: Make receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'receipts';

-- Fix 2: Make payment-receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-receipts';

-- Drop anon policies on receipts
DROP POLICY IF EXISTS "Anon can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anon can view receipts" ON storage.objects;

-- Add authenticated upload policy scoped to user folder for receipts
CREATE POLICY "Authenticated upload receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add authenticated read policy for receipts (same business via own folder)
CREATE POLICY "Authenticated read receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts');

-- Add authenticated upload policy for payment-receipts
CREATE POLICY "Authenticated upload payment_receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add authenticated read policy for payment-receipts
CREATE POLICY "Authenticated read payment_receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-receipts');

-- Fix 3: Tighten audit_logs INSERT policy to prevent forgery
DROP POLICY IF EXISTS "Authenticated users can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());
