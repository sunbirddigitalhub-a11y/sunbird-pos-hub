-- Tighten multi-tenant isolation for user identity tables
-- Profiles: admins/supervisors can only access profiles inside their own business
ALTER POLICY "Admins can view all profiles"
ON public.profiles
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);

ALTER POLICY "Supervisors can view all profiles"
ON public.profiles
USING (
  has_role(auth.uid(), 'supervisor'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);

ALTER POLICY "Admins can update any profile"
ON public.profiles
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);

ALTER POLICY "Admins can delete profiles"
ON public.profiles
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);

ALTER POLICY "Admins can insert profiles"
ON public.profiles
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND business_id = get_user_business_id(auth.uid())
);

-- User roles: admins can only manage/view roles for users in their own business
ALTER POLICY "Admins can view all roles"
ON public.user_roles
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = user_roles.user_id
      AND p.business_id = get_user_business_id(auth.uid())
  )
);

ALTER POLICY "Admins can update roles"
ON public.user_roles
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = user_roles.user_id
      AND p.business_id = get_user_business_id(auth.uid())
  )
)
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = user_roles.user_id
      AND p.business_id = get_user_business_id(auth.uid())
  )
);

ALTER POLICY "Admins can delete roles"
ON public.user_roles
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = user_roles.user_id
      AND p.business_id = get_user_business_id(auth.uid())
  )
);

ALTER POLICY "Admins can manage roles"
ON public.user_roles
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = user_roles.user_id
      AND p.business_id = get_user_business_id(auth.uid())
  )
);