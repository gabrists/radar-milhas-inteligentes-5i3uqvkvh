CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'gratuito',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE TABLE public.travel_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  destination_name TEXT NOT NULL,
  target_miles INTEGER NOT NULL,
  current_miles INTEGER NOT NULL DEFAULT 0,
  target_date DATE
);

ALTER TABLE public.travel_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own travel goals." ON public.travel_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel goals." ON public.travel_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel goals." ON public.travel_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel goals." ON public.travel_goals
  FOR DELETE USING (auth.uid() = user_id);
