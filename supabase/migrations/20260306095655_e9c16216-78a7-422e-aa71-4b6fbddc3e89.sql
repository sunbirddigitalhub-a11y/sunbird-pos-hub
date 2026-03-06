
-- Create storage bucket for receipt screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Allow authenticated users to view receipts
CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts');

-- Allow anon to upload receipts
CREATE POLICY "Anon can upload receipts"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'receipts');

-- Allow anon to view receipts
CREATE POLICY "Anon can view receipts"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'receipts');
