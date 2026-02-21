CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Acúmulo', 'Transferência', 'Compra', 'Resgate')),
  origin_program TEXT,
  destination_program TEXT,
  points_amount NUMERIC NOT NULL,
  bonus_percentage NUMERIC,
  total_received NUMERIC,
  cost NUMERIC,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON public.transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.active_promotions (title, origin, destination, bonus_percentage, link)
VALUES
  ('Bônus de até 100% transferindo da Livelo para Smiles', 'Livelo', 'Smiles', 100, 'https://smiles.com.br'),
  ('Esfera e Latam Pass com 30% de bônus', 'Esfera', 'Latam Pass', 30, 'https://latampass.latam.com'),
  ('Transferência TudoAzul com até 80% de bônus', 'Livelo', 'TudoAzul', 80, 'https://voeazul.com.br');
