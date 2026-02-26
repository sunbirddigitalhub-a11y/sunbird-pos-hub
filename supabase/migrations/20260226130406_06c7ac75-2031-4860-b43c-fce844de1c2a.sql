
-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Smartphone',
  variants TEXT,
  base_price BIGINT NOT NULL DEFAULT 0,
  cost_price BIGINT NOT NULL DEFAULT 0,
  supplier TEXT,
  in_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory (IMEI tracking)
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  imei TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Stock',
  cost_price BIGINT NOT NULL DEFAULT 0,
  selling_price BIGINT NOT NULL DEFAULT 0,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inventory" ON public.inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inventory" ON public.inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete inventory" ON public.inventory FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  total_spent BIGINT NOT NULL DEFAULT 0,
  balance BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  total_amount BIGINT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'Completed',
  notes TEXT,
  sold_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);

-- Sale items
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  imei TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price BIGINT NOT NULL DEFAULT 0,
  total_price BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sale_items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sale_items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- Audit log
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Seed some products
INSERT INTO public.products (name, category, variants, base_price, cost_price, supplier, in_stock) VALUES
  ('iPhone 15 Pro Max 256GB', 'Smartphone', '256GB', 4200000, 3200000, 'Dubai', 3),
  ('Samsung Galaxy S24 Ultra', 'Smartphone', '256GB / 512GB', 2500000, 1800000, 'Dubai', 5),
  ('MacBook Air M3 15"', 'Laptop', '13" / 15"', 5500000, 4000000, 'Dubai', 2),
  ('Tecno Spark 20 Pro+', 'Smartphone', '128GB / 256GB', 600000, 380000, 'China', 12),
  ('iPhone 14 128GB', 'Smartphone', '128GB / 256GB', 2900000, 2200000, 'Dubai', 6),
  ('Samsung Galaxy A15', 'Smartphone', '128GB', 680000, 450000, 'China', 8),
  ('Dell Inspiron 15', 'Laptop', 'i5 / i7', 2400000, 1800000, 'Dubai', 4),
  ('iPad Air M2', 'Tablet', '64GB / 256GB', 3000000, 2200000, 'Dubai', 3);

-- Seed inventory with IMEIs
INSERT INTO public.inventory (product_id, imei, status, cost_price, selling_price, supplier)
SELECT p.id, imei_data.imei, 'In Stock', p.cost_price, p.base_price, p.supplier
FROM public.products p
CROSS JOIN LATERAL (
  SELECT unnest(CASE p.name
    WHEN 'iPhone 15 Pro Max 256GB' THEN ARRAY['356938035643809','356938035643810','356938035643811']
    WHEN 'Samsung Galaxy S24 Ultra' THEN ARRAY['490154203237518','490154203237519','490154203237520','490154203237521','490154203237522']
    WHEN 'MacBook Air M3 15"' THEN ARRAY['C02ZM4XRLVDL','C02ZM4XRLVDM']
    WHEN 'Tecno Spark 20 Pro+' THEN ARRAY['867530012345678','867530012345679','867530012345680']
    WHEN 'iPhone 14 128GB' THEN ARRAY['353456789012345','353456789012346','353456789012347']
    WHEN 'Samsung Galaxy A15' THEN ARRAY['490154203237600','490154203237601']
    WHEN 'Dell Inspiron 15' THEN ARRAY['5CG1234ABC','5CG1234ABD']
    WHEN 'iPad Air M2' THEN ARRAY['DMPC12345678','DMPC12345679']
    ELSE ARRAY[]::TEXT[]
  END) AS imei
) imei_data;

-- Seed some customers
INSERT INTO public.customers (name, phone, email, total_spent) VALUES
  ('John Mukasa', '0772123456', 'john@email.com', 15200000),
  ('Sarah Nantongo', '0701234567', 'sarah@email.com', 7500000),
  ('David Okello', '0782345678', 'david@email.com', 5500000),
  ('Grace Achieng', '0753456789', NULL, 600000),
  ('Peter Waswa', '0774567890', 'peter@email.com', 9800000),
  ('Mary Nabatanzi', '0705678901', NULL, 4200000);
