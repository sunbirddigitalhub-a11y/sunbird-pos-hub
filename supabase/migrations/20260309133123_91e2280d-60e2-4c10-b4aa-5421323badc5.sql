
-- Create staff_permissions table for module-level access control
CREATE TABLE public.staff_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module)
);

-- Enable RLS
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Policies: business-scoped access
CREATE POLICY "Business scoped select staff_permissions"
  ON public.staff_permissions FOR SELECT
  TO authenticated
  USING (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Admins can insert staff_permissions"
  ON public.staff_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'master_admin'::app_role)
    AND (business_id = get_user_business_id(auth.uid()) OR business_id IS NULL)
  );

CREATE POLICY "Admins can update staff_permissions"
  ON public.staff_permissions FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'master_admin'::app_role)
    AND business_id = get_user_business_id(auth.uid())
  );

CREATE POLICY "Admins can delete staff_permissions"
  ON public.staff_permissions FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'master_admin'::app_role)
    AND business_id = get_user_business_id(auth.uid())
  );

-- Auto-set business_id trigger
CREATE TRIGGER set_staff_permissions_business_id
  BEFORE INSERT ON public.staff_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_business_id();
