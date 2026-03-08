-- Update handle_new_user_subscription to include business_id
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_biz_id UUID;
BEGIN
  SELECT business_id INTO user_biz_id FROM public.profiles WHERE user_id = NEW.id LIMIT 1;
  
  INSERT INTO public.subscriptions (user_id, business_id, plan, trial_start, trial_end, is_trial, is_active)
  VALUES (NEW.id, user_biz_id, 'basic', now(), now() + interval '14 days', true, true);
  RETURN NEW;
END;
$$;