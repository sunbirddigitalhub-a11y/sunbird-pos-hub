-- Fix: master_admin limit should be per-business, not global
-- Also increase limit since each business owner gets master_admin
CREATE OR REPLACE FUNCTION public.enforce_master_admin_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_business_id UUID;
  admin_count INT;
  supervisor_count INT;
BEGIN
  -- Get the business_id for this user
  SELECT business_id INTO user_business_id FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  
  IF NEW.role = 'master_admin' THEN
    -- Count master_admins within the same business
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.role = 'master_admin' AND p.business_id = user_business_id;
    
    IF admin_count >= 2 THEN
      RAISE EXCEPTION 'Maximum of 2 Master Admin accounts allowed per business';
    END IF;
  END IF;
  
  IF NEW.role = 'supervisor' THEN
    SELECT COUNT(*) INTO supervisor_count
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.role = 'supervisor' AND p.business_id = user_business_id;
    
    IF supervisor_count >= 10 THEN
      RAISE EXCEPTION 'Maximum of 10 Supervisor accounts allowed per business';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;