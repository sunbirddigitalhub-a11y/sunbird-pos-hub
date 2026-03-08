
-- Table for manually generated activation codes
CREATE TABLE public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'basic',
  duration_days integer NOT NULL DEFAULT 30,
  is_used boolean NOT NULL DEFAULT false,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Only grandmasters can manage codes
CREATE POLICY "Grandmasters can manage activation_codes"
  ON public.activation_codes FOR ALL
  TO authenticated
  USING (is_grandmaster(auth.uid()))
  WITH CHECK (is_grandmaster(auth.uid()));

-- Users can view codes they used
CREATE POLICY "Users can view own used codes"
  ON public.activation_codes FOR SELECT
  TO authenticated
  USING (used_by = auth.uid());
