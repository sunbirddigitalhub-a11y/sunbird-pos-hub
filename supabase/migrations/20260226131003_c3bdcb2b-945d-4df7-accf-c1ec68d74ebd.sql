
-- Allow anon read access so POS works before auth is set up
CREATE POLICY "Anon can view products" ON public.products FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view inventory" ON public.inventory FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view customers" ON public.customers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view sales" ON public.sales FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view sale_items" ON public.sale_items FOR SELECT TO anon USING (true);

-- Allow anon write temporarily (will be locked down with auth)
CREATE POLICY "Anon can insert sales" ON public.sales FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert sale_items" ON public.sale_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert customers" ON public.customers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update customers" ON public.customers FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can update inventory" ON public.inventory FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can insert inventory" ON public.inventory FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert products" ON public.products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update products" ON public.products FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete products" ON public.products FOR DELETE TO anon USING (true);
CREATE POLICY "Anon can insert audit_logs" ON public.audit_logs FOR INSERT TO anon WITH CHECK (true);
