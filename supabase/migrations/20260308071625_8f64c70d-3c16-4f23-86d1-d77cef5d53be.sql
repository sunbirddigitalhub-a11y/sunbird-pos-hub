-- Allow authenticated users to update sales (for recording payments)
CREATE POLICY "Authenticated users can update sales"
ON public.sales FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to update sale_items if needed
CREATE POLICY "Authenticated users can update sale_items"
ON public.sale_items FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);