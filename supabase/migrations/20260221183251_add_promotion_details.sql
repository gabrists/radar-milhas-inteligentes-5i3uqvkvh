ALTER TABLE public.active_promotions 
ADD COLUMN rules_summary TEXT DEFAULT '',
ADD COLUMN valid_until TIMESTAMPTZ;
