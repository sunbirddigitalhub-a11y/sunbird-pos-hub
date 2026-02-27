
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anon can insert settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can update settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Authenticated can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update settings" ON public.settings FOR UPDATE USING (true);

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
