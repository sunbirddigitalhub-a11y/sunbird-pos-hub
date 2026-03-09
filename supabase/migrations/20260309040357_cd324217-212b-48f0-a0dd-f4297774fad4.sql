-- 1) Workspace model for strict tenant boundaries
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main Workspace',
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, name)
);

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_one_default_per_business
  ON public.workspaces (business_id)
  WHERE is_default = true;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workspaces" ON public.workspaces;
CREATE POLICY "Users can view own workspaces"
ON public.workspaces
FOR SELECT
USING (business_id = get_user_business_id(auth.uid()));

DROP POLICY IF EXISTS "Owners can manage own workspaces" ON public.workspaces;
CREATE POLICY "Owners can manage own workspaces"
ON public.workspaces
FOR ALL
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);

-- 2) Add workspace_id to tenant tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.z_reports ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS workspace_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.inventory
      ADD CONSTRAINT inventory_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'z_reports_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.z_reports
      ADD CONSTRAINT z_reports_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expenses_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.expenses
      ADD CONSTRAINT expenses_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_history_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.payment_history
      ADD CONSTRAINT payment_history_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sale_items_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.sale_items
      ADD CONSTRAINT sale_items_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settings_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.settings
      ADD CONSTRAINT settings_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_workspace_id_fkey
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Helper for workspace scoping
CREATE OR REPLACE FUNCTION public.get_user_workspace_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 4) Signup provisioning: business + default workspace + owner profile + owner role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_business_id UUID;
  new_workspace_id UUID;
BEGIN
  INSERT INTO public.businesses (name, owner_user_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Business',
    NEW.id
  )
  RETURNING id INTO new_business_id;

  INSERT INTO public.workspaces (business_id, owner_user_id, name, is_default)
  VALUES (new_business_id, NEW.id, 'Main Workspace', true)
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.profiles (user_id, full_name, email, business_id, workspace_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    new_business_id,
    new_workspace_id
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'master_admin');

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_biz_id UUID;
  user_workspace_id UUID;
BEGIN
  SELECT business_id, workspace_id
  INTO user_biz_id, user_workspace_id
  FROM public.profiles
  WHERE user_id = NEW.id
  LIMIT 1;

  INSERT INTO public.subscriptions (user_id, business_id, workspace_id, plan, trial_start, trial_end, is_trial, is_active)
  VALUES (NEW.id, user_biz_id, user_workspace_id, 'basic', now(), now() + interval '14 days', true, true);

  RETURN NEW;
END;
$function$;

-- 5) Remove cross-tenant bypasses
DROP POLICY IF EXISTS "Grandmasters can manage all businesses" ON public.businesses;

ALTER POLICY "Users can view own business"
ON public.businesses
USING (id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select customers"
ON public.customers
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update customers"
ON public.customers
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped delete customers"
ON public.customers
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select expenses"
ON public.expenses
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update expenses"
ON public.expenses
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped delete expenses"
ON public.expenses
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select inventory"
ON public.inventory
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update inventory"
ON public.inventory
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped delete inventory"
ON public.inventory
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select products"
ON public.products
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update products"
ON public.products
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped delete products"
ON public.products
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select payment_history"
ON public.payment_history
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select sale_items"
ON public.sale_items
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update sale_items"
ON public.sale_items
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select sales"
ON public.sales
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update sales"
ON public.sales
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select settings"
ON public.settings
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update settings"
ON public.settings
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped select z_reports"
ON public.z_reports
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Business scoped update z_reports"
ON public.z_reports
USING (business_id = get_user_business_id(auth.uid()));

ALTER POLICY "Admins can view all subscriptions"
ON public.subscriptions
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);