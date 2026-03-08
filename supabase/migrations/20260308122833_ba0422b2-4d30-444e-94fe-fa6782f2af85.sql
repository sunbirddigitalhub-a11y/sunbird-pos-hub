
-- Allow any authenticated user to check if they are a grandmaster (they can only see their own row via the existing policy, but we need a permissive policy for SELECT)
CREATE POLICY "Users can check own grandmaster status" ON public.grandmasters
  FOR SELECT USING (auth.uid() = user_id);
