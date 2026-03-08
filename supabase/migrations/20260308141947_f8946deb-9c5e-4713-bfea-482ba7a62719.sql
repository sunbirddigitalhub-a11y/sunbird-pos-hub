
-- Fix remaining security: tighten audit_logs INSERT to require auth or use service role
DROP POLICY IF EXISTS "Anon can insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anon can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Anon can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Anon can insert customers" ON public.customers;
