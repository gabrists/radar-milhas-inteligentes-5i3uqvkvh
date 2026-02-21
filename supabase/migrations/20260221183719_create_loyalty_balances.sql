CREATE TABLE public.loyalty_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL CHECK (program_name IN ('Livelo', 'Esfera', 'Smiles', 'Latam Pass', 'TudoAzul')),
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, program_name)
);

ALTER TABLE public.loyalty_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own loyalty balances" 
  ON public.loyalty_balances
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
