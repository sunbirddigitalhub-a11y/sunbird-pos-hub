
-- 1. Extend businesses table with onboarding fields
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'UGX',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 2. Add business_id to data tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.z_reports ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id);

-- 3. Create trigger function to auto-set business_id from user's profile
CREATE OR REPLACE FUNCTION public.set_business_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.business_id IS NULL THEN
    NEW.business_id := get_user_business_id(auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Attach trigger to all data tables
CREATE TRIGGER set_business_id_products BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_customers BEFORE INSERT ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_inventory BEFORE INSERT ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_expenses BEFORE INSERT ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_sales BEFORE INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_sale_items BEFORE INSERT ON public.sale_items FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_payment_history BEFORE INSERT ON public.payment_history FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_z_reports BEFORE INSERT ON public.z_reports FOR EACH ROW EXECUTE FUNCTION public.set_business_id();
CREATE TRIGGER set_business_id_settings BEFORE INSERT ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_business_id();

-- 5. Drop old overly-permissive RLS policies and create business-scoped ones

-- PRODUCTS
DROP POLICY IF EXISTS "Anon can view products" ON public.products;
DROP POLICY IF EXISTS "Anon can insert products" ON public.products;
DROP POLICY IF EXISTS "Anon can update products" ON public.products;
DROP POLICY IF EXISTS "Anon can delete products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "Business scoped select products" ON public.products FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update products" ON public.products FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped delete products" ON public.products FOR DELETE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- CUSTOMERS
DROP POLICY IF EXISTS "Anon can view customers" ON public.customers;
DROP POLICY IF EXISTS "Anon can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anon can update customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;

CREATE POLICY "Business scoped select customers" ON public.customers FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update customers" ON public.customers FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped delete customers" ON public.customers FOR DELETE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- INVENTORY
DROP POLICY IF EXISTS "Anon can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anon can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anon can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can delete inventory" ON public.inventory;

CREATE POLICY "Business scoped select inventory" ON public.inventory FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert inventory" ON public.inventory FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update inventory" ON public.inventory FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped delete inventory" ON public.inventory FOR DELETE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- EXPENSES
DROP POLICY IF EXISTS "Authenticated users can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can delete expenses" ON public.expenses;

CREATE POLICY "Business scoped select expenses" ON public.expenses FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update expenses" ON public.expenses FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped delete expenses" ON public.expenses FOR DELETE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- SALES
DROP POLICY IF EXISTS "Anon can view sales" ON public.sales;
DROP POLICY IF EXISTS "Anon can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;

CREATE POLICY "Business scoped select sales" ON public.sales FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update sales" ON public.sales FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- SALE_ITEMS
DROP POLICY IF EXISTS "Anon can view sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Anon can insert sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can view sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can insert sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can update sale_items" ON public.sale_items;

CREATE POLICY "Business scoped select sale_items" ON public.sale_items FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert sale_items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update sale_items" ON public.sale_items FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- PAYMENT_HISTORY
DROP POLICY IF EXISTS "Authenticated users can view payment_history" ON public.payment_history;
DROP POLICY IF EXISTS "Authenticated users can insert payment_history" ON public.payment_history;

CREATE POLICY "Business scoped select payment_history" ON public.payment_history FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert payment_history" ON public.payment_history FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);

-- Z_REPORTS
DROP POLICY IF EXISTS "Anon can view z_reports" ON public.z_reports;
DROP POLICY IF EXISTS "Anon can insert z_reports" ON public.z_reports;
DROP POLICY IF EXISTS "Anon can update z_reports" ON public.z_reports;
DROP POLICY IF EXISTS "Authenticated can view z_reports" ON public.z_reports;
DROP POLICY IF EXISTS "Authenticated can insert z_reports" ON public.z_reports;
DROP POLICY IF EXISTS "Authenticated can update z_reports" ON public.z_reports;

CREATE POLICY "Business scoped select z_reports" ON public.z_reports FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert z_reports" ON public.z_reports FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update z_reports" ON public.z_reports FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));

-- SETTINGS
DROP POLICY IF EXISTS "Anon can view settings" ON public.settings;
DROP POLICY IF EXISTS "Anon can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Anon can update settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.settings;

CREATE POLICY "Business scoped select settings" ON public.settings FOR SELECT TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
CREATE POLICY "Business scoped insert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL);
CREATE POLICY "Business scoped update settings" ON public.settings FOR UPDATE TO authenticated USING (business_id = get_user_business_id(auth.uid()) OR is_grandmaster(auth.uid()));
