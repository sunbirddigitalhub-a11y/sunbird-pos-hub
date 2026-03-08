
-- Create businesses table for multi-tenancy
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Grandmasters table - platform owners, completely separate from business users
CREATE TABLE public.grandmasters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.grandmasters ENABLE ROW LEVEL SECURITY;

-- Add business_id to profiles
ALTER TABLE public.profiles ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Security definer function to check grandmaster status
CREATE OR REPLACE FUNCTION public.is_grandmaster(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.grandmasters WHERE user_id = _user_id
  )
$$;

-- Security definer function to get user's business_id
CREATE OR REPLACE FUNCTION public.get_user_business_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS for businesses: users can view their own business, grandmasters see all
CREATE POLICY "Users can view own business" ON public.businesses
  FOR SELECT USING (
    id = public.get_user_business_id(auth.uid())
    OR public.is_grandmaster(auth.uid())
  );

CREATE POLICY "Grandmasters can manage all businesses" ON public.businesses
  FOR ALL USING (public.is_grandmaster(auth.uid()));

-- RLS for grandmasters table: only grandmasters can view
CREATE POLICY "Grandmasters can view grandmasters" ON public.grandmasters
  FOR SELECT USING (public.is_grandmaster(auth.uid()));

-- Insert the grandmaster record for sunbirdgroup9@gmail.com
INSERT INTO public.grandmasters (user_id)
SELECT user_id FROM public.profiles WHERE email = 'sunbirdgroup9@gmail.com'
ON CONFLICT DO NOTHING;

-- Create a business for the grandmaster (platform-level)
INSERT INTO public.businesses (name, owner_user_id)
SELECT 'Sunbird Platform', user_id FROM public.profiles WHERE email = 'sunbirdgroup9@gmail.com';

-- Link the grandmaster profile to their business
UPDATE public.profiles
SET business_id = (SELECT id FROM public.businesses WHERE name = 'Sunbird Platform' LIMIT 1)
WHERE email = 'sunbirdgroup9@gmail.com';

-- Update handle_new_user to create a business for each new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_business_id UUID;
BEGIN
  -- Create a business for the new user
  INSERT INTO public.businesses (name, owner_user_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Business',
    NEW.id
  )
  RETURNING id INTO new_business_id;

  -- Create profile linked to the business
  INSERT INTO public.profiles (user_id, full_name, email, business_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    new_business_id
  );

  -- Default role: master_admin (they are the business owner)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'master_admin');

  RETURN NEW;
END;
$$;

-- Link subscriptions to businesses
ALTER TABLE public.subscriptions ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
