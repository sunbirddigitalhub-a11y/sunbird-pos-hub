-- Allow business owners to update their own business
CREATE POLICY "Owners can update own business"
ON public.businesses
FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());
