CREATE TABLE public.active_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  bonus_percentage NUMERIC NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.active_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotions" ON public.active_promotions
  FOR SELECT USING (true);
