
-- Create referrals table for viral referral system
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_type TEXT DEFAULT 'trial_days',
  reward_value INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- Grandmasters can view all referrals
CREATE POLICY "Grandmasters can view all referrals" ON public.referrals
  FOR SELECT USING (public.is_grandmaster(auth.uid()));

-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN referred_by TEXT;
