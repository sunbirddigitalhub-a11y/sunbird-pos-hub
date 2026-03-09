-- Fix linter warnings: remove always-true WITH CHECK expressions

-- audit_logs INSERT policy: require authenticated user
ALTER POLICY "Authenticated users can insert audit_logs"
ON public.audit_logs
WITH CHECK (auth.uid() IS NOT NULL);

-- subscriptions INSERT policy: allow only internal (non-API) inserts, e.g. signup triggers/service operations
ALTER POLICY "System can insert subscriptions"
ON public.subscriptions
WITH CHECK (current_setting('request.jwt.claim.role', true) IS NULL);